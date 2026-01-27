<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Store;
use YooKassa\Client;
use YooKassa\Model\Payment\PaymentInterface;
use YooKassa\Model\Notification\NotificationFactory;
use YooKassa\Model\Notification\NotificationEventType;
use Illuminate\Support\Facades\Log;

class YooKassaService
{
    /**
     * Создать платеж в YooKassa
     *
     * @param Order $order
     * @param Store $store
     * @return array{success: bool, payment_id?: string, payment_url?: string, error?: string}
     */
    public function createPayment(Order $order, Store $store): array
    {
        try {
            $client = $this->getClient($store);

            // Формируем данные чека для 54-ФЗ
            $receiptItems = [];
            foreach ($order->items as $item) {
                $receiptItems[] = [
                    'description' => mb_substr($item->product->name, 0, 128),
                    'quantity' => (string) $item->quantity,
                    'amount' => [
                        'value' => number_format($item->price * $item->quantity, 2, '.', ''),
                        'currency' => 'RUB',
                    ],
                    'vat_code' => $store->vat_code?->value ?? 1, // NO_VAT по умолчанию
                    'payment_mode' => 'full_payment',
                    'payment_subject' => 'commodity',
                ];
            }

            // Добавляем доставку в чек, если есть
            if ($order->delivery_cost > 0) {
                $receiptItems[] = [
                    'description' => 'Доставка',
                    'quantity' => '1',
                    'amount' => [
                        'value' => number_format($order->delivery_cost, 2, '.', ''),
                        'currency' => 'RUB',
                    ],
                    'vat_code' => $store->vat_code?->value ?? 1,
                    'payment_mode' => 'full_payment',
                    'payment_subject' => 'service',
                ];
            }

            // Формируем return_url с параметром order_success
            $returnUrl = config('app.url') . '?order_success=' . $order->id;

            // Создаем платеж
            $payment = $client->createPayment(
                [
                    'amount' => [
                        'value' => number_format($order->total, 2, '.', ''),
                        'currency' => 'RUB',
                    ],
                    'capture' => true,
                    'confirmation' => [
                        'type' => 'redirect',
                        'return_url' => $returnUrl,
                    ],
                    'description' => "Заказ №{$order->order_number}",
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                    'receipt' => [
                        'customer' => [
                            'phone' => $this->formatPhone($order->customer_phone),
                        ],
                        'items' => $receiptItems,
                    ],
                ],
                $this->generateIdempotencyKey($order)
            );

            return [
                'success' => true,
                'payment_id' => $payment->getId(),
                'payment_url' => $payment->getConfirmation()->getConfirmationUrl(),
            ];

        } catch (\Exception $e) {
            Log::error('YooKassa createPayment error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Получить информацию о платеже
     */
    public function getPayment(string $paymentId, Store $store): ?PaymentInterface
    {
        try {
            $client = $this->getClient($store);
            return $client->getPaymentInfo($paymentId);
        } catch (\Exception $e) {
            Log::error('YooKassa getPayment error', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Отменить платеж
     */
    public function cancelPayment(string $paymentId, Store $store): bool
    {
        try {
            $client = $this->getClient($store);
            $payment = $client->getPaymentInfo($paymentId);

            // Можно отменить только платежи в статусе pending или waiting_for_capture
            if ($payment->getStatus() === 'pending' || $payment->getStatus() === 'waiting_for_capture') {
                $client->cancelPayment($paymentId);
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('YooKassa cancelPayment error', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Обработать webhook уведомление от YooKassa
     *
     * @param string $requestBody
     * @return array{event: string, payment_id: string, order_id: int|null, status: string}|null
     */
    public function parseWebhookNotification(string $requestBody): ?array
    {
        try {
            $factory = new NotificationFactory();
            $notification = $factory->factory(json_decode($requestBody, true));

            $payment = $notification->getObject();
            $metadata = $payment->getMetadata();

            return [
                'event' => $notification->getEvent(),
                'payment_id' => $payment->getId(),
                'order_id' => $metadata?->order_id ?? null,
                'status' => $payment->getStatus(),
            ];
        } catch (\Exception $e) {
            Log::error('YooKassa webhook parse error', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }


    /**
     * Получить клиент YooKassa с настройками магазина
     */
    private function getClient(Store $store): Client
    {
        $client = new Client();
        $client->setAuth($store->yookassa_shop_id, $store->yookassa_secret_key);
        return $client;
    }

    /**
     * Генерация ключа идемпотентности для предотвращения дублирования платежей
     */
    private function generateIdempotencyKey(Order $order): string
    {
        return 'order_' . $order->order_number . '_' . $order->id;
    }

    /**
     * Форматирование телефона для YooKassa (только цифры, начиная с 7)
     */
    private function formatPhone(string $phone): string
    {
        // Убираем все кроме цифр
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Если начинается с 8, заменяем на 7
        if (strlen($phone) === 11 && str_starts_with($phone, '8')) {
            $phone = '7' . substr($phone, 1);
        }

        // Если 10 цифр (без кода страны), добавляем 7
        if (strlen($phone) === 10) {
            $phone = '7' . $phone;
        }

        return $phone;
    }
}


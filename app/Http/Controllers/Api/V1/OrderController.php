<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Services\DeliveryService;
use App\Services\PriceModifierService;
use App\Services\PromoCodeService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(
        private PromoCodeService $promoCodeService,
        private TelegramService $telegramService,
        private DeliveryService $deliveryService,
        private PriceModifierService $priceModifier
    ) {}

    /**
     * Получить список заказов текущего пользователя
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product.images', 'city', 'user', 'store'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => OrderResource::collection($orders),
        ]);
    }

    /**
     * Получить подробную информацию о заказе
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        // Проверяем, что заказ принадлежит текущему пользователю
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещен',
            ], 403);
        }

        $order->load(['items.product.images', 'city', 'user', 'store']);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Создать новый заказ
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Генерируем номер заказа
            $orderNumber = Order::generateOrderNumber();

            // Подсчитываем суммы
            $subtotal = 0;
            $orderItems = [];

            // Проверяем, нужно ли применять массовое изменение цен
            $priceChangeInfo = $this->priceModifier->getPriceChangeInfo();
            $shouldModifyPrices = $priceChangeInfo !== null;

            foreach ($request->items as $item) {
                // Загружаем категории только если нужно применять изменение цен
                $product = $shouldModifyPrices
                    ? Product::with('categories')->findOrFail($item['product_id'])
                    : Product::findOrFail($item['product_id']);

                // Получаем цену с учетом массового изменения (если активировано)
                if ($shouldModifyPrices) {
                    $prices = $this->priceModifier->getModifiedPrices($product);
                    $price = $prices['sale_price'] ?? $prices['price'];
                } else {
                    // Используем sale_price если есть, иначе обычную цену
                    $price = $product->sale_price ?? $product->price;
                }

                $quantity = $item['quantity'];
                $total = $price * $quantity;

                $subtotal += $total;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $total,
                ];
            }

            // Применяем промокод (если есть)
            $discount = 0;
            $promoCodeModel = null;

            if ($request->promo_code) {
                $result = $this->promoCodeService->validateAndCalculate($request->promo_code, $subtotal);

                if (!$result['valid']) {
                    return response()->json([
                        'message' => $result['message'],
                    ], 422);
                }

                $discount = $result['discount'];
                $promoCodeModel = $result['promo_code'];
            }

            // Рассчитываем стоимость доставки (только для доставки, не для самовывоза)
            $deliveryCost = 0;
            $deliveryZoneId = null;

            if ($request->delivery_type === 'delivery') {
                // Проверяем, не выбран ли вариант "Уточнить у получателя"
                $isClarifyWithRecipient = $request->delivery_address === 'Уточнить у получателя';

                // Если адрес нужно уточнить, пропускаем расчет доставки
                if (!$isClarifyWithRecipient) {
                    // Проверяем наличие координат
                    if (!$request->delivery_latitude || !$request->delivery_longitude) {
                        return response()->json([
                            'message' => 'Координаты адреса обязательны для расчета стоимости доставки',
                        ], 422);
                    }

                    // Находим магазин по city_id
                    $store = Store::where('city_id', $request->city_id)
                        ->where('is_active', true)
                        ->first();

                    if (!$store) {
                        return response()->json([
                            'message' => 'Магазин в выбранном городе не найден',
                        ], 404);
                    }

                    // Рассчитываем стоимость доставки
                    $deliveryResult = $this->deliveryService->calculateDeliveryCost(
                        latitude: (float) $request->delivery_latitude,
                        longitude: (float) $request->delivery_longitude,
                        storeId: $store->id,
                        subtotal: $subtotal
                    );

                    if (!$deliveryResult['success']) {
                        return response()->json([
                            'message' => $deliveryResult['message'],
                        ], 422);
                    }

                    $deliveryCost = $deliveryResult['delivery_cost'];
                    $deliveryZoneId = $deliveryResult['zone_id'];
                }
                // Если "Уточнить у получателя", стоимость доставки остается 0
            }

            $total = $subtotal - $discount + $deliveryCost;

            // Создаем заказ
            $order = Order::create([
                'order_number' => $orderNumber,
                'status' => 'new',
                'payment_type' => $request->payment_type,
                'payment_status' => 'pending',
                'promo_code' => $request->promo_code,
                'user_id' => $request->user()->id,
                'customer_phone' => $request->user()->phone,
                'is_anonymous' => $request->is_anonymous ?? false,
                'recipient_name' => $request->recipient_name,
                'recipient_phone' => $request->recipient_phone,
                'recipient_social' => $request->recipient_social,
                'city_id' => $request->city_id,
                'delivery_type' => $request->delivery_type,
                'delivery_address' => $request->delivery_address,
                'delivery_date' => $request->delivery_date,
                'delivery_time' => $request->delivery_time,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_cost' => $deliveryCost,
                'delivery_zone_id' => $deliveryZoneId,
                'total' => $total,
            ]);

            // Создаем позиции заказа
            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Применяем промокод (увеличиваем счетчик использований)
            if ($promoCodeModel) {
                $this->promoCodeService->apply($promoCodeModel);
            }

            DB::commit();

            // Загружаем связи для ответа
            $order->load(['items.product.images', 'city', 'user', 'store']);

            $response = [
                'message' => 'Заказ создан успешно',
                'order' => new OrderResource($order),
            ];

            // Если оплата онлайн, создаем платеж в YooKassa
            if ($request->payment_type === 'online') {
                // TODO: Интеграция с YooKassa
                // $paymentUrl = $this->createYooKassaPayment($order);
                // $response['payment_url'] = $paymentUrl;

                $response['payment_url'] = null; // Заглушка для YooKassa
                $response['message'] = 'Заказ создан. Ожидается интеграция с YooKassa для получения ссылки на оплату.';
            }

            // Отправляем уведомление в Telegram
            $this->telegramService->sendNewOrderNotification($order);

            return response()->json($response, 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Ошибка при создании заказа',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Обновить статус оплаты заказа (для webhook YooKassa)
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        try {
            $order->update([
                'payment_status' => $request->payment_status,
                'payment_id' => $request->payment_id,
            ]);

            // Если оплата успешна, меняем статус заказа на "в обработке"
            if ($request->payment_status === 'succeeded') {
                $order->update(['status' => 'processing']);
            }

            // Если оплата отменена, меняем статус заказа на "отменен"
            if ($request->payment_status === 'cancelled') {
                $order->update(['status' => 'cancelled']);
            }

            $order->load(['items.product.images', 'city', 'user', 'store']);

            //TODO: Email-уведомление клиенту о созданном и оплаченном заказе

            return response()->json([
                'message' => 'Статус оплаты обновлен',
                'order' => new OrderResource($order),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при обновлении статуса',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Создать платеж в YooKassa (заготовка для интеграции)
     *
     * @param Order $order
     * @return string|null URL для оплаты
     */
    private function createYooKassaPayment(Order $order): ?string
    {
        // TODO: Интеграция с YooKassa SDK
        //
        // Пример кода для интеграции:
        //
        // use YooKassa\Client;
        //
        // $client = new Client();
        // $client->setAuth($shopId, $secretKey);
        //
        // $payment = $client->createPayment([
        //     'amount' => [
        //         'value' => $order->total,
        //         'currency' => 'RUB',
        //     ],
        //     'confirmation' => [
        //         'type' => 'redirect',
        //         'return_url' => route('payment.success', ['order' => $order->id]),
        //     ],
        //     'capture' => true,
        //     'description' => 'Заказ №' . $order->order_number,
        //     'metadata' => [
        //         'order_id' => $order->id,
        //         'order_number' => $order->order_number,
        //     ],
        // ], uniqid('', true));
        //
        // // Сохраняем ID платежа и URL для оплаты
        // $order->update([
        //     'payment_id' => $payment->getId(),
        //     'payment_url' => $payment->getConfirmation()->getConfirmationUrl(),
        // ]);
        //
        // return $payment->getConfirmation()->getConfirmationUrl();

        return null;
    }

    /**
     * Webhook для обработки уведомлений от YooKassa (заготовка)
     *
     * Этот метод должен быть вызван YooKassa при изменении статуса платежа
     * URL webhook: /api/v1/orders/yookassa-webhook
     */
    public function yookassaWebhook(Request $request): JsonResponse
    {
        // TODO: Интеграция с YooKassa SDK
        //
        // Пример кода для обработки webhook:
        //
        // use YooKassa\Model\Notification\NotificationSucceeded;
        // use YooKassa\Model\Notification\NotificationWaitingForCapture;
        // use YooKassa\Model\Notification\NotificationCanceled;
        //
        // try {
        //     $notification = $request->getContent();
        //     $notificationObject = json_decode($notification, true);
        //
        //     $paymentId = $notificationObject['object']['id'];
        //     $paymentStatus = $notificationObject['object']['status'];
        //
        //     // Находим заказ по payment_id
        //     $order = Order::where('payment_id', $paymentId)->firstOrFail();
        //
        //     // Обновляем статус оплаты
        //     switch ($paymentStatus) {
        //         case 'succeeded':
        //             $order->update([
        //                 'payment_status' => 'succeeded',
        //                 'status' => 'processing',
        //             ]);
        //             break;
        //
        //         case 'canceled':
        //             $order->update([
        //                 'payment_status' => 'cancelled',
        //                 'status' => 'cancelled',
        //             ]);
        //             break;
        //     }
        //
        //     return response()->json(['status' => 'success']);
        //
        // } catch (\Exception $e) {
        //     return response()->json(['error' => $e->getMessage()], 500);
        // }

        return response()->json([
            'message' => 'Webhook для YooKassa (заготовка)',
            'status' => 'pending_integration',
        ]);
    }
}

<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Order;
use App\Models\OrderSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * Отправить сообщение в Telegram
     *
     * @param string $chatId ID чата
     * @param string $message Текст сообщения
     * @param array|null $keyboard Inline клавиатура (опционально)
     * @return bool
     */
    public function sendMessage(string $chatId, string $message, ?array $keyboard = null): bool
    {
        $token = $this->getBotToken();

        if (!$token) {
            Log::warning('Telegram bot token не настроен');
            return false;
        }

        $url = "https://api.telegram.org/bot{$token}/sendMessage";

        $data = [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
        ];

        if ($keyboard) {
            $data['reply_markup'] = json_encode(['inline_keyboard' => $keyboard]);
        }

        try {
            $response = Http::post($url, $data);

            if ($response->successful()) {
                Log::info('Telegram сообщение отправлено', ['chat_id' => $chatId]);
                return true;
            }

            Log::error('Ошибка отправки Telegram сообщения', [
                'chat_id' => $chatId,
                'response' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Исключение при отправке Telegram сообщения', [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Отправить уведомление о новом заказе
     *
     * @param Order $order
     * @return bool
     */
    public function sendNewOrderNotification(Order $order): bool
    {
        // Проверяем, включены ли уведомления
        if (!$this->isNotificationsEnabled()) {
            return false;
        }

        // Получаем chat_id магазина через город
        $chatId = $this->getStoreChatId($order);

        if (!$chatId) {
            Log::warning('Telegram chat_id не найден для заказа', ['order_id' => $order->id]);
            return false;
        }

        // Формируем сообщение
        $message = $this->formatNewOrderMessage($order);

        // Формируем кнопку для просмотра заказа в админке
        $keyboard = [
            [
                [
                    'text' => '📋 Просмотреть заказ',
                    'url' => $this->getAdminOrderUrl($order),
                ],
            ],
        ];

        return $this->sendMessage($chatId, $message, $keyboard);
    }

    /**
     * Получить токен бота из настроек
     *
     * @return string|null
     */
    private function getBotToken(): ?string
    {
        $settings = OrderSetting::first();
        return $settings?->telegram_bot_token;
    }

    /**
     * Проверить, включены ли уведомления
     *
     * @return bool
     */
    private function isNotificationsEnabled(): bool
    {
        $settings = OrderSetting::first();
        return $settings?->telegram_notifications_enabled ?? false;
    }

    /**
     * Получить chat_id магазина из заказа
     *
     * @param Order $order
     * @return string|null
     */
    private function getStoreChatId(Order $order): ?string
    {
        // Получаем первый активный магазин в городе заказа
        $store = $order->city?->stores()->where('is_active', true)->first();
        return $store?->telegram_chat_id;
    }

    /**
     * Форматировать сообщение о новом заказе
     *
     * @param Order $order
     * @return string
     */
    private function formatNewOrderMessage(Order $order): string
    {
        // Определяем статус оплаты с эмодзи
        $paymentStatus = match ($order->payment_type) {
            PaymentType::ONLINE->value => match ($order->payment_status) {
                PaymentStatus::SUCCEEDED->value => '✅ Оплачен онлайн',
                PaymentStatus::CANCELLED->value => '❌ Оплата отменена',
                default => '⏳ Ожидает оплаты онлайн',
            },
            default => '💵 Оплата при получении',
        };

        return sprintf(
            "🔔 <b>Новый заказ #%s</b>\n\n" .
            "👤 <b>Заказчик:</b> %s\n" .
            "🏙 <b>Город:</b> %s\n" .
            "📍 <b>Адрес доставки:</b> %s\n" .
            "📅 <b>Дата доставки:</b> %s\n" .
            "⏰ <b>Время доставки:</b> %s\n" .
            "💳 <b>Статус оплаты:</b> %s\n" .
            "💰 <b>Сумма:</b> %s ₽",
            $order->order_number,
            $order->user?->name ?? 'Гость',
            $order->city?->name ?? 'Не указан',
            $order->recipient_name ?? 'Не указан',
            $order->delivery_date?->format('d.m.Y') ?? 'Не указана',
            $order->delivery_time ?? 'Не указано',
            $paymentStatus,
            number_format($order->total, 2, '.', ' ')
        );
    }

    /**
     * Получить URL для просмотра заказа в админке
     *
     * @param Order $order
     * @return string
     */
    private function getAdminOrderUrl(Order $order): string
    {
        return url("/admin/orders/{$order->id}");
    }
}


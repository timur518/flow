<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Order;
use App\Models\Store;
use App\Models\OrderSetting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * 1. Проверить, включены ли уведомления
     *
     * @return bool
     */
    private function isNotificationsEnabled(): bool
    {
        $settings = OrderSetting::first();
        return $settings?->telegram_notifications_enabled ?? false;
    }

    /**
     * 2. Получить токен бота из настроек
     *
     * @return string|null
     */
    private function getBotToken(): ?string
    {
        $settings = OrderSetting::first();
        return $settings?->telegram_bot_token;
    }

    /**
     * 3. Отправить сообщение в Telegram
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
                PaymentStatus::CANCELLED->value => '❌ Оплата не проведена',
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
            $order->delivery_address ?? 'Не указан',
            $order->delivery_date?->format('d.m.Y') ?? 'Не указана',
            $order->delivery_time ?? 'Не указано',
            $paymentStatus,
            number_format($order->total, 2, '.', ' ')
        );
    }

    /**
     * Форматировать сообщение об отмене заказа
     *
     * @param Order $order
     * @return string
     */
    private function formatCancelledOrderMessage(Order $order): string
    {
        return sprintf(
            "❌ <b>Заказ #%s отменён</b>\n\n" .
            "⚠️ <b>Причина:</b> Истёк срок оплаты\n\n" .
            "👤 <b>Заказчик:</b> %s\n" .
            "📞 <b>Телефон:</b> %s\n" .
            "🏙 <b>Город:</b> %s\n" .
            "💰 <b>Сумма:</b> %s ₽",
            $order->order_number,
            $order->user?->name ?? 'Гость',
            $order->user?->phone ?? 'Не указан',
            $order->city?->name ?? 'Не указан',
            number_format($order->total, 2, '.', ' ')
        );
    }

    /**
     * Форматировать сообщение о новом пользователе
     *
     * @param User $user
     * @return string
     */
    private function formatNewUserMessage(User $user): string
    {
        return sprintf(
            "👤 <b>Новая регистрация</b>\n\n" .
            "📝 <b>Имя:</b> %s\n" .
            "📧 <b>Email:</b> %s\n" .
            "📞 <b>Телефон:</b> %s\n",
            $user->name ?? 'Не указано',
            $user->email ?? 'Не указан',
            $user->phone ?? 'Не указан',
        );
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
        $storeId = $order->store_id;
        $chatId = Store::find($storeId)->telegram_chat_id;

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
     * Получить URL для просмотра заказа в админке
     *
     * @param Order $order
     * @return string
     */
    private function getAdminOrderUrl(Order $order): string
    {
        return url("/admin/orders/{$order->id}");
    }

    /**
     * Отправить уведомление о новой регистрации пользователя
     *
     * @param User $user
     * @return bool
     */
    public function sendNewUserRegistrationNotification(User $user): bool
    {
        // Проверяем, включены ли уведомления
        if (!$this->isNotificationsEnabled()) {
            return false;
        }

        // Получаем chat_ids из настроек (общие для всех уведомлений)
        $settings = OrderSetting::first();
        $chatIds = $settings?->telegram_chat_ids;

        if (!$chatIds) {
            Log::warning('Telegram chat_ids не настроены для уведомлений о регистрации');
            return false;
        }

        // Формируем сообщение
        $message = $this->formatNewUserMessage($user);

        // Отправляем во все чаты
        $chatIdsArray = array_map('trim', explode(',', $chatIds));
        $success = false;

        foreach ($chatIdsArray as $chatId) {
            if ($this->sendMessage($chatId, $message)) {
                $success = true;
            }
        }

        return $success;
    }

    /**
     * Отправить уведомление об отмене заказа (истёк срок оплаты)
     *
     * @param Order $order
     * @return bool
     */
    public function sendOrderCancelledNotification(Order $order): bool
    {
        // Проверяем, включены ли уведомления
        if (!$this->isNotificationsEnabled()) {
            return false;
        }

        // Получаем chat_id магазина через город
        $storeId = $order->store_id;
        $chatId = Store::find($storeId)->telegram_chat_id;

        if (!$chatId) {
            Log::warning('Telegram chat_id не найден для отменённого заказа', ['order_id' => $order->id]);
            return false;
        }

        // Формируем сообщение
        $message = $this->formatCancelledOrderMessage($order);

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
}


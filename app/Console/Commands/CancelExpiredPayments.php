<?php

namespace App\Console\Commands;

use App\Mail\OrderPaymentCancelledMail;
use App\Models\Order;
use App\Services\EmailService;
use App\Services\TelegramService;
use App\Services\YooKassaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelExpiredPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:cancel-expired {--minutes=30 : Количество минут для истечения срока платежа}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Отмена неоплаченных заказов с онлайн-оплатой после истечения срока';

    public function __construct(
        private readonly YooKassaService $yooKassaService,
        private readonly TelegramService $telegramService,
        private readonly EmailService $emailService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $minutes = (int) $this->option('minutes');
        $expiredAt = now()->subMinutes($minutes);

        $this->info("Поиск неоплаченных заказов старше {$minutes} минут...");

        // Находим заказы с онлайн-оплатой в статусе pending, созданные более X минут назад
        $expiredOrders = Order::where('payment_type', 'online')
            ->where('payment_status', 'pending')
            ->where('created_at', '<', $expiredAt)
            ->with('store')
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('Просроченных заказов не найдено.');
            return Command::SUCCESS;
        }

        $this->info("Найдено {$expiredOrders->count()} просроченных заказов.");

        $cancelledCount = 0;
        $errorCount = 0;

        foreach ($expiredOrders as $order) {
            try {
                $this->processExpiredOrder($order);
                $cancelledCount++;
                $this->line("  ✓ Заказ #{$order->order_number} отменён");
            } catch (\Exception $e) {
                $errorCount++;
                $this->error("  ✗ Ошибка при отмене заказа #{$order->order_number}: {$e->getMessage()}");
                Log::error('CancelExpiredPayments error', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Завершено. Отменено: {$cancelledCount}, ошибок: {$errorCount}");

        return Command::SUCCESS;
    }

    /**
     * Обработка просроченного заказа
     */
    private function processExpiredOrder(Order $order): void
    {
        // Пытаемся отменить платеж в YooKassa, если есть payment_id
        if ($order->payment_id && $order->store) {
            $this->yooKassaService->cancelPayment($order->payment_id, $order->store);
        }

        // Обновляем статусы заказа
        $order->update([
            'status' => 'cancelled',
            'payment_status' => 'cancelled',
        ]);

        Log::info('Заказ отменен из-за истечения срока оплаты', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'payment_id' => $order->payment_id,
        ]);

        // Отправляем Telegram уведомление магазину об отмене заказа
        $this->telegramService->sendOrderCancelledNotification($order);

        // Отправляем email уведомление клиенту об отмене заказа из-за неоплаты
        $order->load(['items', 'user']);
        if ($order->user && $order->user->email) {
            $this->emailService->send($order->user->email, new OrderPaymentCancelledMail($order));
        }
    }
}


<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\YooKassaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        protected YooKassaService $yooKassaService
    ) {}

    /**
     * Обработка возврата пользователя из YooKassa после оплаты
     * 
     * YooKassa перенаправляет сюда пользователя с параметрами:
     * - orderId - ID заказа (мы добавляем в return_url)
     */
    public function return(Request $request)
    {
        $orderId = $request->query('orderId');
        
        if (!$orderId) {
            Log::warning('Payment return: orderId not provided');
            return $this->redirectToSite();
        }

        $order = Order::find($orderId);
        
        if (!$order) {
            Log::warning('Payment return: order not found', ['orderId' => $orderId]);
            return $this->redirectToSite();
        }

        // Проверяем статус платежа в YooKassa
        if ($order->payment_id && $order->store) {
            try {
                $payment = $this->yooKassaService->getPayment($order->payment_id, $order->store);
                
                if ($payment) {
                    $status = $payment->getStatus();
                    
                    // Если платёж успешен - редирект с параметром order_success
                    if ($status === 'succeeded') {
                        return $this->redirectToSite(['order_success' => $orderId]);
                    }
                    
                    // Если платёж ещё в процессе (pending/waiting_for_capture)
                    if (in_array($status, ['pending', 'waiting_for_capture'])) {
                        // Пользователь вернулся, но платёж ещё обрабатывается
                        // Показываем страницу с информацией, что платёж обрабатывается
                        return $this->redirectToSite(['order_pending' => $orderId]);
                    }
                    
                    // Если платёж отменён или завершился ошибкой
                    if ($status === 'canceled') {
                        return $this->redirectToSite(['order_cancelled' => $orderId]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Payment return: failed to get payment status', [
                    'orderId' => $orderId,
                    'paymentId' => $order->payment_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Если не удалось проверить статус - редирект на главную
        // Webhook обработает платёж позже
        return $this->redirectToSite(['order_pending' => $orderId]);
    }

    /**
     * Редирект на сайт с опциональными query параметрами
     */
    protected function redirectToSite(array $params = [])
    {
        $url = config('app.url');
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        return redirect($url);
    }
}


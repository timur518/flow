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
use App\Services\YooKassaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct(
        private PromoCodeService $promoCodeService,
        private TelegramService $telegramService,
        private DeliveryService $deliveryService,
        private PriceModifierService $priceModifier,
        private YooKassaService $yooKassaService
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

            // Находим магазин по city_id
            $store = Store::where('city_id', $request->city_id)
                ->where('is_active', true)
                ->first();

            if (!$store) {
                return response()->json([
                    'message' => 'Магазин в выбранном городе не найден',
                ], 404);
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
                'store_id' => $store->id,
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
                try {
                    $paymentResult = $this->yooKassaService->createPayment($order, $store);

                    // Сохраняем данные платежа в заказ
                    $order->update([
                        'payment_id' => $paymentResult['payment_id'],
                        'payment_url' => $paymentResult['payment_url'],
                    ]);

                    $response['payment_url'] = $paymentResult['payment_url'];
                    $response['message'] = 'Заказ создан. Перейдите по ссылке для оплаты.';

                } catch (\Exception $e) {
                    Log::error('YooKassa payment creation failed', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);

                    // Если не удалось создать платёж, отменяем заказ
                    $order->update(['status' => 'cancelled', 'payment_status' => 'cancelled']);

                    return response()->json([
                        'message' => 'Ошибка при создании платежа. Попробуйте позже.',
                        'error' => $e->getMessage(),
                    ], 500);
                }
            } else {
                // Для наличной оплаты отправляем Telegram уведомление сразу
                $this->telegramService->sendNewOrderNotification($order);

                // TODO: Email-уведомление клиенту о созданном заказе
            }

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
     * Webhook для обработки уведомлений от YooKassa
     *
     * URL webhook: POST /api/v1/orders/yookassa-webhook
     * Документация: https://yookassa.ru/developers/using-api/webhooks
     */
    public function yookassaWebhook(Request $request): JsonResponse
    {
        // Валидация IP-адресов YooKassa
        // https://yookassa.ru/developers/using-api/webhooks#ip
        $allowedIps = [
            '185.71.76.0/27',
            '185.71.77.0/27',
            '77.75.153.0/25',
            '77.75.156.11',
            '77.75.156.35',
            '77.75.154.128/25',
            '2a02:5180::/32',
        ];

        $clientIp = $request->ip();
        $isAllowedIp = false;

        foreach ($allowedIps as $allowedIp) {
            if ($this->ipInRange($clientIp, $allowedIp)) {
                $isAllowedIp = true;
                break;
            }
        }

        if (!$isAllowedIp) {
            Log::warning('YooKassa webhook: запрос с неразрешённого IP', [
                'ip' => $clientIp,
            ]);
            return response()->json(['error' => 'Forbidden'], 403);
        }

        try {
            $requestBody = $request->getContent();

            Log::info('YooKassa webhook: получено уведомление', [
                'body' => $requestBody,
            ]);

            // Парсим уведомление через сервис
            $notification = $this->yooKassaService->parseWebhookNotification($requestBody);

            if (!$notification) {
                Log::error('YooKassa webhook: не удалось распарсить уведомление');
                return response()->json(['error' => 'Invalid notification'], 400);
            }

            $event = $notification['event'];
            $paymentId = $notification['payment_id'];
            $orderId = $notification['order_id'];
            $status = $notification['status'];

            Log::info('YooKassa webhook: обработка события', [
                'event' => $event,
                'payment_id' => $paymentId,
                'order_id' => $orderId,
                'status' => $status,
            ]);

            // Находим заказ
            $order = Order::where('payment_id', $paymentId)->first();

            if (!$order && $orderId) {
                $order = Order::find($orderId);
            }

            if (!$order) {
                Log::error('YooKassa webhook: заказ не найден', [
                    'payment_id' => $paymentId,
                    'order_id' => $orderId,
                ]);
                return response()->json(['error' => 'Order not found'], 404);
            }

            // Обрабатываем события от Юкассы
            switch ($event) {
                case 'payment.succeeded':
                    $order->update([
                        'payment_status' => 'succeeded',
                        'status' => 'processing',
                    ]);

                    // Отправляем Telegram уведомление магазину
                    $this->telegramService->sendNewOrderNotification($order);

                    // TODO: Email-уведомление клиенту об успешной оплате заказа

                    Log::info('YooKassa webhook: платёж успешен', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ]);
                    break;

                case 'payment.canceled':
                    $order->update([
                        'payment_status' => 'cancelled',
                        'status' => 'cancelled',
                    ]);

                    // TODO: Email-уведомление клиенту об отмене заказа

                    Log::info('YooKassa webhook: платёж отменён', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ]);
                    break;

                default:
                    Log::info('YooKassa webhook: неизвестное событие', [
                        'event' => $event,
                    ]);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('YooKassa webhook: ошибка обработки', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Проверка, входит ли IP-адрес в диапазон CIDR
     *
     * @param string $ip
     * @param string $range
     * @return bool
     */
    private function ipInRange(string $ip, string $range): bool
    {
        // Если это не диапазон, а конкретный IP
        if (strpos($range, '/') === false) {
            return $ip === $range;
        }

        // IPv6
        if (strpos($range, ':') !== false) {
            // Упрощённая проверка для IPv6 — проверяем префикс
            [$subnet, $bits] = explode('/', $range);
            // Для IPv6 нужна более сложная логика, пока пропускаем IPv6 адреса
            if (strpos($ip, ':') !== false) {
                return strpos($ip, rtrim($subnet, ':')) === 0;
            }
            return false;
        }

        // IPv4
        [$subnet, $bits] = explode('/', $range);
        $ip = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask = -1 << (32 - (int)$bits);
        $subnet &= $mask;

        return ($ip & $mask) === $subnet;
    }
}

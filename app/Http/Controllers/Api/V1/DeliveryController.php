<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(
        private DeliveryService $deliveryService
    ) {}

    /**
     * Рассчитать стоимость доставки по координатам адреса
     *
     * POST /api/v1/delivery/calculate
     *
     * Body:
     * {
     *   "store_id": 1,
     *   "latitude": 55.7558,
     *   "longitude": 37.6173,
     *   "subtotal": 2500.00
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_id' => ['required', 'integer', 'exists:stores,id'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ], [
            'store_id.required' => 'ID магазина обязателен',
            'store_id.exists' => 'Магазин не найден',
            'latitude.required' => 'Широта обязательна',
            'latitude.between' => 'Некорректная широта',
            'longitude.required' => 'Долгота обязательна',
            'longitude.between' => 'Некорректная долгота',
            'subtotal.required' => 'Сумма заказа обязательна',
            'subtotal.min' => 'Сумма заказа должна быть положительной',
        ]);

        $result = $this->deliveryService->calculateDeliveryCost(
            latitude: (float) $validated['latitude'],
            longitude: (float) $validated['longitude'],
            storeId: (int) $validated['store_id'],
            subtotal: (float) $validated['subtotal']
        );

        return response()->json([
            'success' => $result['success'],
            'data' => $result['success'] ? [
                'zone_id' => $result['zone_id'],
                'zone_name' => $result['zone_name'],
                'delivery_cost' => $result['delivery_cost'],
                'is_free' => $result['is_free'],
                'min_free_delivery_amount' => $result['min_free_delivery_amount'],
                'message' => $result['message'],
            ] : null,
            'message' => $result['message'],
        ], $result['success'] ? 200 : 404);
    }
}


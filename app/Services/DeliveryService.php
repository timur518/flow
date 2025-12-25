<?php

namespace App\Services;

use App\Models\DeliveryZone;
use App\Models\Store;

class DeliveryService
{
    /**
     * Рассчитать стоимость доставки по координатам адреса
     *
     * @param float $latitude Широта адреса доставки
     * @param float $longitude Долгота адреса доставки
     * @param int $storeId ID магазина
     * @param float $subtotal Сумма заказа (для проверки бесплатной доставки)
     * @return array{success: bool, zone_id: int|null, zone_name: string|null, delivery_cost: float, is_free: bool, min_free_delivery_amount: float|null, message: string|null}
     */
    public function calculateDeliveryCost(float $latitude, float $longitude, int $storeId, float $subtotal): array
    {
        // Находим зону доставки по координатам
        $zone = $this->findDeliveryZone($latitude, $longitude, $storeId);

        // Если зона не найдена
        if (!$zone) {
            return [
                'success' => false,
                'zone_id' => null,
                'zone_name' => null,
                'delivery_cost' => 0,
                'is_free' => false,
                'min_free_delivery_amount' => null,
                'message' => 'К сожалению, доставка по указанному адресу недоступна',
            ];
        }

        // Проверяем, бесплатная ли доставка
        $isFree = false;
        $deliveryCost = (float) $zone->delivery_cost;
        $minFreeDeliveryAmount = $zone->min_free_delivery_amount ? (float) $zone->min_free_delivery_amount : null;

        if ($minFreeDeliveryAmount && $subtotal >= $minFreeDeliveryAmount) {
            $isFree = true;
            $deliveryCost = 0;
        }

        // Формируем сообщение
        $message = null;
        if (!$isFree && $minFreeDeliveryAmount) {
            $remaining = $minFreeDeliveryAmount - $subtotal;
            if ($remaining > 0) {
                $message = sprintf('До бесплатной доставки не хватает %.2f ₽', $remaining);
            }
        }

        return [
            'success' => true,
            'zone_id' => $zone->id,
            'zone_name' => $zone->name,
            'delivery_cost' => round($deliveryCost, 2),
            'is_free' => $isFree,
            'min_free_delivery_amount' => $minFreeDeliveryAmount,
            'message' => $message,
        ];
    }

    /**
     * Найти зону доставки по координатам
     *
     * @param float $latitude Широта
     * @param float $longitude Долгота
     * @param int $storeId ID магазина
     * @return DeliveryZone|null
     */
    public function findDeliveryZone(float $latitude, float $longitude, int $storeId): ?DeliveryZone
    {
        // Получаем все зоны доставки магазина
        $zones = DeliveryZone::where('store_id', $storeId)
            ->whereNotNull('polygon_coordinates')
            ->orderBy('sort_order')
            ->get();

        // Проверяем каждую зону
        foreach ($zones as $zone) {
            if ($this->isPointInPolygon($latitude, $longitude, $zone->polygon_coordinates)) {
                return $zone;
            }
        }

        return null;
    }

    /**
     * Проверить, находится ли точка внутри полигона (Ray Casting Algorithm)
     *
     * @param float $latitude Широта точки
     * @param float $longitude Долгота точки
     * @param array $polygon Массив координат полигона [[lat, lng], [lat, lng], ...]
     * @return bool
     */
    private function isPointInPolygon(float $latitude, float $longitude, array $polygon): bool
    {
        if (empty($polygon) || count($polygon) < 3) {
            return false;
        }

        $intersections = 0;
        $verticesCount = count($polygon);

        for ($i = 0; $i < $verticesCount; $i++) {
            $vertex1 = $polygon[$i];
            $vertex2 = $polygon[($i + 1) % $verticesCount];

            // Проверяем, что вершины имеют правильный формат
            if (!isset($vertex1[0], $vertex1[1], $vertex2[0], $vertex2[1])) {
                continue;
            }

            $lat1 = (float) $vertex1[0];
            $lng1 = (float) $vertex1[1];
            $lat2 = (float) $vertex2[0];
            $lng2 = (float) $vertex2[1];

            // Ray casting algorithm
            if ($longitude > min($lng1, $lng2)) {
                if ($longitude <= max($lng1, $lng2)) {
                    if ($latitude <= max($lat1, $lat2)) {
                        if ($lng1 != $lng2) {
                            $xinters = ($longitude - $lng1) * ($lat2 - $lat1) / ($lng2 - $lng1) + $lat1;
                            if ($lat1 == $lat2 || $latitude <= $xinters) {
                                $intersections++;
                            }
                        }
                    }
                }
            }
        }

        // Если количество пересечений нечетное, точка внутри полигона
        return ($intersections % 2) != 0;
    }
}


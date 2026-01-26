<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Получить список активных магазинов
     *
     * Query параметры:
     * - city_id (integer, optional): фильтр по городу
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $query = Store::query()
            ->with('city:id,name')
            ->where('is_active', true);

        // Фильтр по городу
        if (request()->has('city_id')) {
            $query->where('city_id', request()->integer('city_id'));
        }

        $stores = $query
            ->orderBy('sort_order')
            ->get([
                'id',
                'city_id',
                'address',
                'phone',
                'email',
                'latitude',
                'longitude',
                'yandex_maps_url',
                'working_hours',
                'whatsapp_url',
                'telegram_chat_url',
                'telegram_channel_url',
                'max_chat_url',
                'max_group_url',
                'instagram_url',
                'vk_url',
                'sort_order',
            ]);

        return response()->json([
            'success' => true,
            'data' => $stores->map(function ($store) {
                return [
                    'id' => $store->id,
                    'city' => [
                        'id' => $store->city->id,
                        'name' => $store->city->name,
                    ],
                    'address' => $store->address,
                    'phone' => $store->phone,
                    'email' => $store->email,
                    'latitude' => $store->latitude,
                    'longitude' => $store->longitude,
                    'yandex_maps_url' => $store->yandex_maps_url,
                    'yandex_maps_code' => $store->yandex_maps_code,
                    'working_hours' => $store->working_hours,
                    'social_links' => [
                        'whatsapp' => $store->whatsapp_url,
                        'telegram_chat' => $store->telegram_chat_url,
                        'telegram_channel' => $store->telegram_channel_url,
                        'max_chat' => $store->max_chat_url,
                        'max_group' => $store->max_group_url,
                        'instagram' => $store->instagram_url,
                        'vk' => $store->vk_url,
                    ],
                    'sort_order' => $store->sort_order,
                ];
            }),
        ]);
    }

    /**
     * Получить подробную информацию о магазине
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $store = Store::query()
            ->with([
                'city:id,name',
                'deliveryPeriods:id,store_id,time_range,sort_order',
                'deliveryZones:id,store_id,name,polygon_coordinates,delivery_cost,min_free_delivery_amount,sort_order',
            ])
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $store->id,
                'city' => [
                    'id' => $store->city->id,
                    'name' => $store->city->name,
                ],
                'address' => $store->address,
                'phone' => $store->phone,
                'email' => $store->email,
                'latitude' => $store->latitude,
                'longitude' => $store->longitude,
                'yandex_maps_url' => $store->yandex_maps_url,
                'yandex_maps_code' => $store->yandex_maps_code,
                'working_hours' => $store->working_hours,
                'social_links' => [
                    'whatsapp' => $store->whatsapp_url,
                    'telegram_chat' => $store->telegram_chat_url,
                    'telegram_channel' => $store->telegram_channel_url,
                    'telegram_chat_id' => $store->telegram_chat_id,
                    'max_chat' => $store->max_chat_url,
                    'max_group' => $store->max_group_url,
                    'instagram' => $store->instagram_url,
                    'vk' => $store->vk_url,
                ],
                'legal_info' => [
                    'legal_name' => $store->legal_name,
                    'inn' => $store->inn,
                    'ogrn' => $store->ogrn,
                    'legal_address' => $store->legal_address,
                ],
                'payment_settings' => [
                    'orders_blocked' => $store->orders_blocked,
                    'payment_on_delivery' => $store->payment_on_delivery,
                    'payment_online' => $store->payment_online,
                ],
                'delivery_periods' => $store->deliveryPeriods->map(function ($period) {
                    return [
                        'id' => $period->id,
                        'time_range' => $period->time_range,
                        'sort_order' => $period->sort_order,
                    ];
                }),
                'delivery_zones' => $store->deliveryZones->map(function ($zone) {
                    return [
                        'id' => $zone->id,
                        'name' => $zone->name,
                        'polygon_coordinates' => $zone->polygon_coordinates,
                        'delivery_cost' => $zone->delivery_cost,
                        'min_free_delivery_amount' => $zone->min_free_delivery_amount,
                        'sort_order' => $zone->sort_order,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Получить периоды доставки магазина
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deliveryPeriods(int $id): JsonResponse
    {
        $store = Store::query()
            ->where('is_active', true)
            ->findOrFail($id);

        $deliveryPeriods = $store->deliveryPeriods()
            ->orderBy('sort_order')
            ->get(['id', 'store_id', 'time_range', 'sort_order']);

        return response()->json([
            'success' => true,
            'data' => $deliveryPeriods->map(function ($period) {
                return [
                    'id' => $period->id,
                    'time_range' => $period->time_range,
                    'sort_order' => $period->sort_order,
                ];
            }),
        ]);
    }

    /**
     * Получить зоны доставки магазина
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deliveryZones(int $id): JsonResponse
    {
        $store = Store::query()
            ->where('is_active', true)
            ->findOrFail($id);

        $deliveryZones = $store->deliveryZones()
            ->orderBy('sort_order')
            ->get(['id', 'store_id', 'name', 'polygon_coordinates', 'delivery_cost', 'min_free_delivery_amount', 'sort_order']);

        return response()->json([
            'success' => true,
            'data' => $deliveryZones->map(function ($zone) {
                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'polygon_coordinates' => $zone->polygon_coordinates,
                    'delivery_cost' => $zone->delivery_cost,
                    'min_free_delivery_amount' => $zone->min_free_delivery_amount,
                    'sort_order' => $zone->sort_order,
                ];
            }),
        ]);
    }
}


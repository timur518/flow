<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    /**
     * Получить список активных городов
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $cities = City::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'region', 'latitude', 'longitude', 'sort_order']);

        return response()->json([
            'success' => true,
            'data' => $cities->map(function ($city) {
                return [
                    'id' => $city->id,
                    'name' => $city->name,
                    'region' => $city->region,
                    'latitude' => $city->latitude,
                    'longitude' => $city->longitude,
                    'sort_order' => $city->sort_order,
                ];
            }),
        ]);
    }
}


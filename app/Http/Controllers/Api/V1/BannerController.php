<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController
{
    /**
     * Получить список активных баннеров
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Banner::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });

        // Фильтрация по городу
        if ($request->has('city_id')) {
            $cityId = $request->input('city_id');
            $query->where(function ($q) use ($cityId) {
                $q->where('city_id', $cityId)
                    ->orWhereNull('city_id'); // Баннеры для всех городов
            });
        }

        $banners = $query
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'image', 'link_url', 'city_id', 'name', 'sort_order']);

        return response()->json([
            'success' => true,
            'data' => $banners->map(function ($banner) {
                return [
                    'id' => $banner->id,
                    'image' => url(Storage::disk('public')->url($banner->image)),
                    'link_url' => $banner->link_url,
                    'name' => $banner->name,
                    'city_id' => $banner->city_id,
                    'sort_order' => $banner->sort_order,
                ];
            }),
        ]);
    }
}


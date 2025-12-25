<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    /**
     * Получить список тегов
     *
     * Query параметры:
     * - include_inactive (boolean): включить неактивные теги (по умолчанию false)
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $query = Tag::query();

        // По умолчанию показываем только активные теги
        if (!request()->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        $tags = $query
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'sort_order', 'is_active']);

        return response()->json([
            'success' => true,
            'data' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                    'sort_order' => $tag->sort_order,
                    'is_active' => $tag->is_active,
                ];
            }),
        ]);
    }
}


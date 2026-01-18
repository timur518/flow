<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Получить список категорий
     *
     * Query параметры:
     * - include_inactive (boolean): включить неактивные категории (по умолчанию false)
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $query = Category::query();

        // По умолчанию показываем только активные категории
        if (!request()->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        $categories = $query
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'image', 'menu_image', 'name', 'slug', 'sort_order', 'is_active']);

        return response()->json([
            'success' => true,
            'data' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image ? asset('storage/' . $category->image) : null,
                    'menu_image' => $category->menu_image ? asset('storage/' . $category->menu_image) : null,
                    'sort_order' => $category->sort_order,
                    'is_active' => $category->is_active,
                ];
            }),
        ]);
    }
}


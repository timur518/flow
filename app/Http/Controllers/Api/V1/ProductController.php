<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Product;
use App\Services\PriceModifierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController
{
    protected PriceModifierService $priceModifier;

    public function __construct(PriceModifierService $priceModifier)
    {
        $this->priceModifier = $priceModifier;
    }
    /**
     * Получить список товаров с фильтрацией
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with(['categories', 'tags', 'images']);

        // Фильтрация по городу
        if ($request->has('city_id')) {
            $query->whereHas('cities', function ($q) use ($request) {
                $q->where('cities.id', $request->input('city_id'));
            });
        }

        // Фильтрация по категории
        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->input('category_id'));
            });
        }

        // Фильтрация по тегу
        if ($request->has('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->input('tag_id'));
            });
        }

        // Исключаем товары с неактивными ингредиентами
        // Применяем это условие ПЕРЕД поиском, чтобы избежать конфликтов
        $query->whereDoesntHave('ingredients', function ($q) {
            $q->where('ingredients.is_active', false);
        });

        // Расширенный поиск по названию, описанию и составу (ингредиентам)
        // Поиск регистронезависимый (case-insensitive)
        // На MySQL с utf8mb4_unicode_ci работает автоматически
        // На SQLite используем mb_strtolower для совместимости
        if ($request->has('search')) {
            $search = $request->input('search');
            $driver = config('database.default');

            $query->where(function ($q) use ($search, $driver) {
                if ($driver === 'sqlite') {
                    // SQLite: используем поиск по обоим регистрам
                    $searchLower = mb_strtolower($search);
                    $searchUpper = mb_strtoupper($search);
                    $searchTitle = mb_convert_case($search, MB_CASE_TITLE, 'UTF-8');

                    $q->where(function ($subQ) use ($search, $searchLower, $searchUpper, $searchTitle) {
                        $subQ->where('name', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$searchLower}%")
                            ->orWhere('name', 'like', "%{$searchUpper}%")
                            ->orWhere('name', 'like', "%{$searchTitle}%");
                    })
                    ->orWhere(function ($subQ) use ($search, $searchLower, $searchUpper, $searchTitle) {
                        $subQ->where('description', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$searchLower}%")
                            ->orWhere('description', 'like', "%{$searchUpper}%")
                            ->orWhere('description', 'like', "%{$searchTitle}%");
                    })
                    ->orWhereHas('ingredients', function ($ingredientQuery) use ($search, $searchLower, $searchUpper, $searchTitle) {
                        $ingredientQuery->where(function ($subQ) use ($search, $searchLower, $searchUpper, $searchTitle) {
                            $subQ->where('ingredients.name', 'like', "%{$search}%")
                                ->orWhere('ingredients.name', 'like', "%{$searchLower}%")
                                ->orWhere('ingredients.name', 'like', "%{$searchUpper}%")
                                ->orWhere('ingredients.name', 'like', "%{$searchTitle}%");
                        });
                    });
                } else {
                    // MySQL/MariaDB: используем стандартный LIKE (case-insensitive по умолчанию с utf8mb4_unicode_ci)
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('ingredients', function ($ingredientQuery) use ($search) {
                            $ingredientQuery->where('ingredients.name', 'like', "%{$search}%");
                        });
                }
            });
        }

        // Фильтр по наличию акции
        if ($request->has('on_sale') && $request->boolean('on_sale')) {
            $query->whereNotNull('sale_price');
        }

        // Сортировка
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortOrder = $request->input('sort_order', 'asc');

        if (in_array($sortBy, ['sort_order', 'price', 'name', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        // Дополнительная сортировка по ID для стабильности
        $query->orderBy('id', 'asc');

        $products = $query->get();

        return response()->json([
            'success' => true,
            'data' => $products->map(function ($product) {
                $firstImage = $product->images->first();
                $prices = $this->priceModifier->getModifiedPrices($product);

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $prices['price'],
                    'sale_price' => $prices['sale_price'],
                    'image' => $firstImage ? url(Storage::disk('public')->url($firstImage->image)) : null,
                    'width' => $product->width,
                    'height' => $product->height,
                    'categories' => $product->categories->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                        ];
                    }),
                    'tags' => $product->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                            'color' => $tag->color,
                        ];
                    }),
                ];
            }),
        ]);
    }

    /**
     * Получить подробную информацию о товаре
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::query()
            ->where('is_active', true)
            ->with(['categories', 'tags', 'images', 'cities', 'ingredients'])
            ->findOrFail($id);

        $prices = $this->priceModifier->getModifiedPrices($product);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $prices['price'],
                'sale_price' => $prices['sale_price'],
                'width' => $product->width,
                'height' => $product->height,
                'categories' => $product->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                    ];
                }),
                'tags' => $product->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'color' => $tag->color,
                    ];
                }),
                'images' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image' => url(Storage::disk('public')->url($image->image)),
                        'sort_order' => $image->sort_order,
                    ];
                }),
                'cities' => $product->cities->map(function ($city) {
                    return [
                        'id' => $city->id,
                        'name' => $city->name,
                    ];
                }),
                'ingredients' => $product->ingredients->map(function ($ingredient) {
                    return [
                        'id' => $ingredient->id,
                        'name' => $ingredient->name,
                        'quantity' => $ingredient->pivot->quantity,
                    ];
                }),
            ],
        ]);
    }
}


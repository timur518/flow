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
            ->withActiveIngredients() // Исключаем товары с неактивными ингредиентами
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

        // Поиск по названию
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
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


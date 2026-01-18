<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProductIngredientPerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_filtering_uses_single_query()
    {
        // Создаем тестовые данные: 50 товаров с 10 ингредиентами каждый
        $city = City::create(['name' => 'Test City', 'is_active' => true]);
        $category = Category::create(['name' => 'Test Category', 'slug' => 'test', 'is_active' => true]);

        // Создаем 20 ингредиентов (10 активных, 10 неактивных)
        $activeIngredients = [];
        $inactiveIngredients = [];

        for ($i = 1; $i <= 10; $i++) {
            $activeIngredients[] = Ingredient::create([
                'name' => "Active Ingredient $i",
                'is_active' => true,
            ]);
        }

        for ($i = 1; $i <= 10; $i++) {
            $inactiveIngredients[] = Ingredient::create([
                'name' => "Inactive Ingredient $i",
                'is_active' => false,
            ]);
        }

        // Создаем 50 товаров
        for ($i = 1; $i <= 50; $i++) {
            $product = Product::create([
                'name' => "Product $i",
                'price' => 1000 + $i,
                'is_active' => true,
            ]);

            $product->categories()->attach($category->id);
            $product->cities()->attach($city->id);

            // Половина товаров с активными ингредиентами, половина с неактивными
            if ($i <= 25) {
                // Товары 1-25: только активные ингредиенты
                foreach (array_slice($activeIngredients, 0, 10) as $ingredient) {
                    $product->ingredients()->attach($ingredient->id, ['quantity' => rand(1, 5)]);
                }
            } else {
                // Товары 26-50: есть хотя бы один неактивный ингредиент
                foreach (array_slice($activeIngredients, 0, 5) as $ingredient) {
                    $product->ingredients()->attach($ingredient->id, ['quantity' => rand(1, 5)]);
                }
                // Добавляем один неактивный
                $product->ingredients()->attach($inactiveIngredients[0]->id, ['quantity' => 1]);
            }
        }

        // Включаем логирование запросов
        DB::enableQueryLog();

        // Выполняем запрос через API
        $response = $this->getJson('/api/v1/products');

        // Получаем все выполненные запросы
        $queries = DB::getQueryLog();

        // Проверяем количество запросов
        // Ожидаемые запросы:
        // 1. SELECT products с NOT EXISTS для фильтрации
        // 2. SELECT categories (eager loading)
        // 3. SELECT tags (eager loading)
        // 4. SELECT product_images (eager loading)
        // 5+. SELECT order_settings для каждого товара (N+1 от PriceModifierService - это отдельная проблема)

        // Главное - проверяем, что фильтрация ингредиентов использует NOT EXISTS в одном запросе
        $mainQuery = $queries[0]['query'];
        $this->assertStringContainsString('not exists', strtolower($mainQuery),
            "Main query should use NOT EXISTS for filtering. Query: $mainQuery"
        );

        // Проверяем, что нет отдельных запросов для каждого товара к таблице ingredients
        $ingredientQueries = collect($queries)->filter(function ($query) {
            return str_contains(strtolower($query['query']), 'from "ingredients"')
                && !str_contains(strtolower($query['query']), 'not exists');
        });

        $this->assertCount(0, $ingredientQueries,
            "Should not have separate ingredient queries (N+1). Found: " . $ingredientQueries->count()
        );

        // Проверяем, что вернулись только товары с активными ингредиентами
        $response->assertStatus(200);
        $data = $response->json('data');

        // Должно вернуться 25 товаров (только с активными ингредиентами)
        $this->assertCount(25, $data);

        DB::disableQueryLog();
    }

    public function test_scope_generates_efficient_sql()
    {
        // Создаем минимальные данные
        $ingredient = Ingredient::create(['name' => 'Test', 'is_active' => false]);
        $product = Product::create(['name' => 'Test Product', 'price' => 100, 'is_active' => true]);
        $product->ingredients()->attach($ingredient->id, ['quantity' => 1]);

        DB::enableQueryLog();

        // Выполняем запрос со scope
        Product::withActiveIngredients()->get();

        $queries = DB::getQueryLog();

        // Должен быть только один основной SELECT запрос
        $this->assertCount(1, $queries);

        // Проверяем, что запрос использует NOT EXISTS
        $sql = $queries[0]['query'];
        $this->assertStringContainsString('not exists', strtolower($sql),
            "Query should use NOT EXISTS for efficiency. Actual query: $sql"
        );

        DB::disableQueryLog();
    }
}


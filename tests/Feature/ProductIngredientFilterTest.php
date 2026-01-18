<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductIngredientFilterTest extends TestCase
{
    use RefreshDatabase;

    protected Product $productWithActiveIngredients;
    protected Product $productWithInactiveIngredient;
    protected Product $productWithoutIngredients;
    protected Ingredient $activeIngredient1;
    protected Ingredient $activeIngredient2;
    protected Ingredient $inactiveIngredient;
    protected City $city;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Создаем город и категорию
        $this->city = City::create([
            'name' => 'Тестовый город',
            'is_active' => true,
        ]);

        $this->category = Category::create([
            'name' => 'Тестовая категория',
            'slug' => 'test-category',
            'is_active' => true,
        ]);

        // Создаем ингредиенты
        $this->activeIngredient1 = Ingredient::create([
            'name' => 'Красная роза',
            'is_active' => true,
        ]);

        $this->activeIngredient2 = Ingredient::create([
            'name' => 'Белая роза',
            'is_active' => true,
        ]);

        $this->inactiveIngredient = Ingredient::create([
            'name' => 'Редкий цветок (нет в наличии)',
            'is_active' => false,
        ]);

        // Товар 1: Все ингредиенты активны
        $this->productWithActiveIngredients = Product::create([
            'name' => 'Букет из роз',
            'price' => 1000,
            'is_active' => true,
        ]);
        $this->productWithActiveIngredients->ingredients()->attach([
            $this->activeIngredient1->id => ['quantity' => 5],
            $this->activeIngredient2->id => ['quantity' => 3],
        ]);
        $this->productWithActiveIngredients->categories()->attach($this->category->id);
        $this->productWithActiveIngredients->cities()->attach($this->city->id);

        // Товар 2: Есть неактивный ингредиент
        $this->productWithInactiveIngredient = Product::create([
            'name' => 'Эксклюзивный букет',
            'price' => 2000,
            'is_active' => true,
        ]);
        $this->productWithInactiveIngredient->ingredients()->attach([
            $this->activeIngredient1->id => ['quantity' => 2],
            $this->inactiveIngredient->id => ['quantity' => 1],
        ]);
        $this->productWithInactiveIngredient->categories()->attach($this->category->id);
        $this->productWithInactiveIngredient->cities()->attach($this->city->id);

        // Товар 3: Без ингредиентов
        $this->productWithoutIngredients = Product::create([
            'name' => 'Простой букет',
            'price' => 500,
            'is_active' => true,
        ]);
        $this->productWithoutIngredients->categories()->attach($this->category->id);
        $this->productWithoutIngredients->cities()->attach($this->city->id);
    }

    public function test_scope_filters_products_with_inactive_ingredients()
    {
        $products = Product::withActiveIngredients()->get();

        // Должны вернуться только товары с активными ингредиентами или без ингредиентов
        $this->assertCount(2, $products);
        $this->assertTrue($products->contains($this->productWithActiveIngredients));
        $this->assertTrue($products->contains($this->productWithoutIngredients));
        $this->assertFalse($products->contains($this->productWithInactiveIngredient));
    }

    public function test_api_does_not_return_products_with_inactive_ingredients()
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200);
        $data = $response->json('data');

        // Проверяем, что вернулись только 2 товара
        $this->assertCount(2, $data);

        // Проверяем, что товар с неактивным ингредиентом не вернулся
        $productIds = collect($data)->pluck('id')->toArray();
        $this->assertContains($this->productWithActiveIngredients->id, $productIds);
        $this->assertContains($this->productWithoutIngredients->id, $productIds);
        $this->assertNotContains($this->productWithInactiveIngredient->id, $productIds);
    }

    public function test_deactivating_ingredient_hides_related_products()
    {
        // Сначала все товары видны (кроме того, что уже имеет неактивный ингредиент)
        $response = $this->getJson('/api/v1/products');
        $this->assertCount(2, $response->json('data'));

        // Деактивируем активный ингредиент
        $this->activeIngredient1->update(['is_active' => false]);

        // Теперь должен остаться только товар без ингредиентов
        $response = $this->getJson('/api/v1/products');
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertEquals($this->productWithoutIngredients->id, $data[0]['id']);
    }
}


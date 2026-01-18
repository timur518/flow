<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\City;
use App\Models\OrderSetting;
use App\Models\Product;
use App\Services\PriceModifierService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PriceModificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Создаем тестовые данные
        $this->category1 = Category::create([
            'name' => 'Розы',
            'slug' => 'roses',
            'is_active' => true,
        ]);

        $this->category2 = Category::create([
            'name' => 'Тюльпаны',
            'slug' => 'tulips',
            'is_active' => true,
        ]);

        $this->city = City::create([
            'name' => 'Москва',
            'is_active' => true,
        ]);

        $this->product1 = Product::create([
            'name' => 'Букет роз',
            'price' => 1000.00,
            'sale_price' => 800.00,
            'is_active' => true,
        ]);
        $this->product1->categories()->attach($this->category1->id);
        $this->product1->cities()->attach($this->city->id);

        $this->product2 = Product::create([
            'name' => 'Букет тюльпанов',
            'price' => 500.00,
            'is_active' => true,
        ]);
        $this->product2->categories()->attach($this->category2->id);
        $this->product2->cities()->attach($this->city->id);
    }

    public function test_price_modification_disabled()
    {
        OrderSetting::create([
            'bulk_price_change_enabled' => false,
            'price_change_percentage' => 10,
        ]);

        $service = new PriceModifierService();
        $prices = $service->getModifiedPrices($this->product1);

        // Цены не должны измениться
        $this->assertEquals(1000.00, $prices['price']);
        $this->assertEquals(800.00, $prices['sale_price']);
    }

    public function test_price_modification_enabled_all_products()
    {
        OrderSetting::create([
            'bulk_price_change_enabled' => true,
            'price_change_percentage' => 10,
            'selected_category_ids' => null,
        ]);

        $service = new PriceModifierService();

        // У product1 есть sale_price, поэтому модифицируются обе цены
        $prices1 = $service->getModifiedPrices($this->product1);
        $this->assertEquals(1100.00, $prices1['price']); // price увеличена на 10%
        $this->assertEquals(880.00, $prices1['sale_price']); // sale_price увеличена на 10%

        // У product2 нет sale_price, поэтому модифицируется только price
        $prices2 = $service->getModifiedPrices($this->product2);
        $this->assertEquals(550.00, $prices2['price']); // price увеличена на 10%
        $this->assertNull($prices2['sale_price']);
    }

    public function test_price_modification_enabled_specific_categories()
    {
        OrderSetting::create([
            'bulk_price_change_enabled' => true,
            'price_change_percentage' => 20,
            'selected_category_ids' => [$this->category1->id],
        ]);

        $service = new PriceModifierService();

        // Товар из выбранной категории (у него есть sale_price) - обе цены модифицируются
        $prices1 = $service->getModifiedPrices($this->product1);
        $this->assertEquals(1200.00, $prices1['price']); // price увеличена на 20%
        $this->assertEquals(960.00, $prices1['sale_price']); // sale_price увеличена на 20%

        // Товар из невыбранной категории
        $prices2 = $service->getModifiedPrices($this->product2);
        $this->assertEquals(500.00, $prices2['price']); // цена не меняется
        $this->assertNull($prices2['sale_price']);
    }

    public function test_price_modification_negative_percentage()
    {
        OrderSetting::create([
            'bulk_price_change_enabled' => true,
            'price_change_percentage' => -15,
            'selected_category_ids' => null,
        ]);

        $service = new PriceModifierService();

        // У product1 есть sale_price, поэтому модифицируются обе цены
        $prices1 = $service->getModifiedPrices($this->product1);
        $this->assertEquals(850.00, $prices1['price']); // price уменьшена на 15%
        $this->assertEquals(680.00, $prices1['sale_price']); // sale_price уменьшена на 15%

        // У product2 нет sale_price, поэтому модифицируется только price
        $prices2 = $service->getModifiedPrices($this->product2);
        $this->assertEquals(425.00, $prices2['price']); // price уменьшена на 15%
        $this->assertNull($prices2['sale_price']);
    }

    public function test_api_returns_modified_prices()
    {
        OrderSetting::create([
            'bulk_price_change_enabled' => true,
            'price_change_percentage' => 10,
            'selected_category_ids' => null,
        ]);

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'sale_price',
                    ]
                ],
            ]);

        // Проверяем, что цены модифицированы
        $data = $response->json('data');

        // product1 имеет sale_price, поэтому модифицируются обе цены
        $product1 = collect($data)->firstWhere('id', $this->product1->id);
        $this->assertEquals(1100.00, $product1['price']); // price увеличена на 10%
        $this->assertEquals(880.00, $product1['sale_price']); // sale_price увеличена на 10%

        // product2 не имеет sale_price, поэтому модифицируется только price
        $product2 = collect($data)->firstWhere('id', $this->product2->id);
        $this->assertEquals(550.00, $product2['price']);
    }
}


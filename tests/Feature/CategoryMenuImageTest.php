<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CategoryMenuImageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_category_can_have_menu_image()
    {
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'image' => 'categories/cover.jpg',
            'menu_image' => 'categories/menu/icon.jpg',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'menu_image' => 'categories/menu/icon.jpg',
        ]);
    }

    public function test_api_returns_menu_image_url()
    {
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'image' => 'categories/cover.jpg',
            'menu_image' => 'categories/menu/icon.jpg',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'image',
                        'menu_image',
                        'sort_order',
                        'is_active',
                    ]
                ]
            ]);

        $data = $response->json('data');
        $categoryData = collect($data)->firstWhere('id', $category->id);

        $this->assertNotNull($categoryData);
        $this->assertStringContainsString('storage/categories/cover.jpg', $categoryData['image']);
        $this->assertStringContainsString('storage/categories/menu/icon.jpg', $categoryData['menu_image']);
    }

    public function test_api_returns_null_when_menu_image_not_set()
    {
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200);

        $data = $response->json('data');
        $categoryData = collect($data)->firstWhere('id', $category->id);

        $this->assertNull($categoryData['image']);
        $this->assertNull($categoryData['menu_image']);
    }

    public function test_category_can_have_different_images()
    {
        $category = Category::create([
            'name' => 'Flowers',
            'slug' => 'flowers',
            'image' => 'categories/flowers-cover.jpg',
            'menu_image' => 'categories/menu/flowers-icon.jpg',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/categories');
        $data = $response->json('data');
        $categoryData = collect($data)->firstWhere('id', $category->id);

        // Проверяем, что обе картинки разные
        $this->assertNotEquals($categoryData['image'], $categoryData['menu_image']);
        $this->assertStringContainsString('flowers-cover.jpg', $categoryData['image']);
        $this->assertStringContainsString('flowers-icon.jpg', $categoryData['menu_image']);
    }
}


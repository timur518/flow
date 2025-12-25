<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Models\ProductImage;
use Filament\Resources\Pages\CreateRecord;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    protected static ?string $title = 'Создать товар';

    protected function afterCreate(): void
    {
        // Save images
        $images = $this->data['images'] ?? [];
        foreach ($images as $index => $image) {
            ProductImage::create([
                'product_id' => $this->record->id,
                'image' => $image,
                'sort_order' => $index,
            ]);
        }

        // Save composition (ingredients)
        $composition = $this->data['composition'] ?? [];
        $syncData = [];
        foreach ($composition as $item) {
            if (!empty($item['ingredient_id'])) {
                $syncData[$item['ingredient_id']] = ['quantity' => $item['quantity'] ?? 1];
            }
        }
        $this->record->ingredients()->sync($syncData);
    }
}

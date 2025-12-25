<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Models\ProductImage;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    public function getTitle(): string
    {
        return 'Редактировать: ' . $this->record->name;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Load images
        $data['images'] = $this->record->images->pluck('image')->toArray();

        // Load composition (ingredients)
        $data['composition'] = $this->record->ingredients->map(function ($ingredient) {
            return [
                'ingredient_id' => $ingredient->id,
                'quantity' => $ingredient->pivot->quantity,
            ];
        })->toArray();

        return $data;
    }

    protected function afterSave(): void
    {
        // Save images
        $images = $this->data['images'] ?? [];
        $this->record->images()->delete();
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

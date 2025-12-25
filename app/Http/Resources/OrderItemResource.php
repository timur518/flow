<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'quantity' => $this->quantity,
            'price' => (float) $this->price,
            'total' => (float) $this->total,
            'product' => $this->when($this->product, function () {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'description' => $this->product->description,
                    'price' => (float) $this->product->price,
                    'sale_price' => $this->product->sale_price ? (float) $this->product->sale_price : null,
                    'width' => $this->product->width,
                    'height' => $this->product->height,
                    'is_active' => (bool) $this->product->is_active,
                    'images' => $this->product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'sort_order' => $image->sort_order,
                        ];
                    }),
                ];
            }),
        ];
    }
}

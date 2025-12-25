<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
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
            'address' => $this->address,
            'apartment' => $this->apartment,
            'entrance' => $this->entrance,
            'floor' => $this->floor,
            'intercom' => $this->intercom,
            'comment' => $this->comment,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'is_default' => (bool) $this->is_default,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

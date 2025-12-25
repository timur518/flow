<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryZone extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'polygon_coordinates',
        'delivery_cost',
        'min_free_delivery_amount',
        'sort_order',
    ];

    protected $casts = [
        'polygon_coordinates' => 'array',
        'delivery_cost' => 'decimal:2',
        'min_free_delivery_amount' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}

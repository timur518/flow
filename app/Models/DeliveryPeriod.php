<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryPeriod extends Model
{
    protected $fillable = [
        'store_id',
        'time_range',
        'sort_order',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}

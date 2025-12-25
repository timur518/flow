<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'usage_limit',
        'usage_count',
        'discount_amount',
        'discount_percent',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];
}

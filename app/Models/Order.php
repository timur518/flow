<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'status',
        'payment_type',
        'payment_status',
        'payment_id',
        'payment_url',
        'promo_code',
        'courier',
        'user_id',
        'customer_phone',
        'is_anonymous',
        'recipient_name',
        'recipient_phone',
        'recipient_social',
        'city_id',
        'delivery_type',
        'delivery_address',
        'delivery_date',
        'delivery_time',
        'subtotal',
        'discount',
        'delivery_cost',
        'delivery_zone_id',
        'total',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'delivery_cost' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function deliveryZone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public static function generateOrderNumber(): string
    {
        return (string) mt_rand(10000, 99999);
    }
}


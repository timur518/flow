<?php

namespace App\Models;

use App\Enums\VatCode;
use App\Traits\BelongsToCity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use BelongsToCity;
    protected $fillable = [
        'city_id',
        'address',
        'phone',
        'email',
        'whatsapp_url',
        'telegram_chat_url',
        'telegram_channel_url',
        'max_chat_url',
        'max_group_url',
        'instagram_url',
        'vk_url',
        'telegram_chat_id',
        'latitude',
        'longitude',
        'yandex_maps_url',
        'yandex_maps_code',
        'working_hours',
        'legal_name',
        'inn',
        'ogrn',
        'legal_address',
        'orders_blocked',
        'payment_on_delivery',
        'payment_online',
        'yookassa_shop_id',
        'yookassa_secret_key',
        'vat_code',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'orders_blocked' => 'boolean',
        'payment_on_delivery' => 'boolean',
        'payment_online' => 'boolean',
        'vat_code' => VatCode::class,
        'is_active' => 'boolean',
        'inn' => 'string',
        'ogrn' => 'string',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function deliveryPeriods(): HasMany
    {
        return $this->hasMany(DeliveryPeriod::class)->orderBy('sort_order');
    }

    public function deliveryZones(): HasMany
    {
        return $this->hasMany(DeliveryZone::class)->orderBy('sort_order');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'city_id', 'city_id');
    }
}

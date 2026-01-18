<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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
        'delivery_cost' => 'decimal:2',
        'min_free_delivery_amount' => 'decimal:2',
    ];

    /**
     * Accessor для polygon_coordinates - преобразует JSON строку в массив
     * Обрабатывает случай двойного JSON-кодирования (когда в БД хранится "\"[[...]]\"")
     */
    protected function polygonCoordinates(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (is_array($value)) {
                    return $value;
                }

                if (is_string($value)) {
                    // Первая попытка декодирования
                    $decoded = json_decode($value, true);

                    // Если результат - строка, значит было двойное кодирование
                    if (is_string($decoded)) {
                        $decoded = json_decode($decoded, true);
                    }

                    return is_array($decoded) ? $decoded : null;
                }

                return null;
            },
            set: function ($value) {
                if (is_array($value)) {
                    return json_encode($value);
                }
                if (is_string($value)) {
                    // Проверяем, что это валидный JSON
                    $decoded = json_decode($value, true);
                    if (is_array($decoded)) {
                        return json_encode($decoded);
                    }
                }
                return $value;
            }
        );
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}

<?php

namespace App\Models;

use App\Traits\BelongsToCity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    use BelongsToCity;

    protected $fillable = [
        'image',
        'link_url',
        'city_id',
        'name',
        'start_date',
        'end_date',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Разрешить null значение city_id.
     * Баннеры с city_id = null видны всем city_admin (общие баннеры).
     */
    public function allowNullCity(): bool
    {
        return true;
    }
}

<?php

namespace App\Traits;

use App\Scopes\CityScope;

/**
 * Trait для моделей, которые принадлежат городу.
 * 
 * Автоматически применяет CityScope для фильтрации данных
 * по городу текущего пользователя (для city_admin).
 * 
 * Использование:
 * - Добавьте `use BelongsToCity;` в модель
 * - Модель должна иметь поле city_id
 * - Переопределите getCityScopeColumn() если колонка называется иначе
 * - Переопределите allowNullCity() если null означает "для всех городов"
 */
trait BelongsToCity
{
    /**
     * Boot trait - регистрирует CityScope.
     */
    public static function bootBelongsToCity(): void
    {
        static::addGlobalScope(new CityScope());
    }

    /**
     * Получить название колонки для фильтрации по городу.
     * Переопределите в модели если колонка называется иначе.
     */
    public function getCityScopeColumn(): string
    {
        return 'city_id';
    }

    /**
     * Разрешить null значение city_id (означает "для всех городов").
     * Переопределите в модели и верните true, если записи с null
     * должны быть видны всем city_admin.
     */
    public function allowNullCity(): bool
    {
        return false;
    }
}


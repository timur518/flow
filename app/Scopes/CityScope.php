<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Global Scope для фильтрации данных по городу пользователя.
 * 
 * Применяется автоматически к моделям с trait BelongsToCity.
 * - super_admin: видит все данные
 * - city_admin: видит только данные своего города
 */
class CityScope implements Scope
{
    /**
     * Применить scope к запросу.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        // Если пользователь не авторизован или это super_admin - не применяем фильтр
        if (!$user || $user->hasRole('super_admin')) {
            return;
        }

        // Если это city_admin - фильтруем по его городу
        if ($user->hasRole('city_admin') && $user->city_id) {
            $columnName = $model->getCityScopeColumn();
            
            // Для моделей где city_id может быть null (например, баннеры для всех городов)
            // показываем записи с city_id пользователя ИЛИ с null
            if ($model->allowNullCity()) {
                $builder->where(function ($query) use ($columnName, $user) {
                    $query->where($columnName, $user->city_id)
                          ->orWhereNull($columnName);
                });
            } else {
                $builder->where($columnName, $user->city_id);
            }
        }
    }
}


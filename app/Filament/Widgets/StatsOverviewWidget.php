<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $user = Auth::user();
        $isCityAdmin = $user && $user->hasRole('city_admin') && $user->city_id;

        // Описание для city_admin
        $cityLabel = $isCityAdmin ? ' (ваш город)' : '';

        // 1. Всего клиентов (users с ролью customer)
        // Global Scope автоматически фильтрует по городу для city_admin
        $totalCustomers = User::role('customer')->count();

        // 2. Всего заказов
        // Global Scope автоматически фильтрует по городу для city_admin
        $totalOrders = Order::count();

        // 3. Заказы в работе (статус != Завершен / Отменен)
        $ordersInProgress = Order::whereNotIn('status', [
            OrderStatus::COMPLETED->value,
            OrderStatus::CANCELLED->value,
        ])->count();

        // 4. Всего выручка (статус != отменен)
        $totalRevenue = Order::where('status', '!=', OrderStatus::CANCELLED->value)
            ->sum('total');

        return [
            Stat::make('Всего клиентов', $totalCustomers)
                ->description('Зарегистрированных пользователей' . $cityLabel)
                ->descriptionIcon('heroicon-o-user-group')
                ->color('success'),

            Stat::make('Всего заказов', $totalOrders)
                ->description('За все время' . $cityLabel)
                ->descriptionIcon('heroicon-o-shopping-bag')
                ->color('primary'),

            Stat::make('Заказы в работе', $ordersInProgress)
                ->description('Активные заказы' . $cityLabel)
                ->descriptionIcon('heroicon-o-clock')
                ->color('warning'),

            Stat::make('Общая выручка', number_format($totalRevenue, 0, ',', ' ') . ' ₽')
                ->description('Без учета отмененных' . $cityLabel)
                ->descriptionIcon('heroicon-o-currency-dollar')
                ->color('success'),
        ];
    }
}


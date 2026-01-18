<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        // 1. Всего клиентов (users с ролью customer)
        $totalCustomers = User::role('customer')->count();

        // 2. Всего заказов
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
                ->description('Зарегистрированных пользователей')
                ->descriptionIcon('heroicon-o-user-group')
                ->color('success'),

            Stat::make('Всего заказов', $totalOrders)
                ->description('За все время')
                ->descriptionIcon('heroicon-o-shopping-bag')
                ->color('primary'),

            Stat::make('Заказы в работе', $ordersInProgress)
                ->description('Активные заказы')
                ->descriptionIcon('heroicon-o-clock')
                ->color('warning'),

            Stat::make('Общая выручка', number_format($totalRevenue, 0, ',', ' ') . ' ₽')
                ->description('Без учета отмененных')
                ->descriptionIcon('heroicon-o-currency-dollar')
                ->color('success'),
        ];
    }
}


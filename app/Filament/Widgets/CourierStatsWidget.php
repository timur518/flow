<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CourierStatsWidget extends BaseWidget
{
    protected static bool $isDiscovered = false; // Временно отключаем виджет
    protected static ?int $sort = 5;
    protected int | string | array $columnSpan = [
        'md' => 2,
        'xl' => 1,
    ];

    public function getTableRecordKey($record): string
    {
        return $record->courier;
    }

    protected function getTableHeading(): string
    {
        $user = Auth::user();
        $heading = 'Статистика по курьерам';

        if ($user && $user->hasRole('city_admin') && $user->city) {
            $heading .= ' (' . $user->city->name . ')';
        }

        return $heading;
    }

    public function table(Table $table): Table
    {
        // Global Scope автоматически фильтрует заказы по городу для city_admin
        return $table
            ->heading($this->getTableHeading())
            ->query(
                Order::query()
                    ->select([
                        'id',
                        'courier',
                        DB::raw('COUNT(*) OVER (PARTITION BY courier) as orders_count'),
                        DB::raw('SUM(total) OVER (PARTITION BY courier) as total_amount')
                    ])
                    ->where('status', OrderStatus::COMPLETED->value)
                    ->whereNotNull('courier')
                    ->where('courier', '!=', '')
                    ->groupBy('id', 'courier', 'total')
            )
            ->columns([
                TextColumn::make('courier')
                    ->label('Курьер')
                    ->searchable()
                    ->icon('heroicon-o-truck')
                    ->iconColor('primary'),

                TextColumn::make('orders_count')
                    ->label('Кол-во заказов')
                    ->alignCenter()
                    ->badge()
                    ->color('success')
                    ->suffix(' шт.'),

                TextColumn::make('total_amount')
                    ->label('Сумма заказов')
                    ->money('RUB')
                    ->alignEnd(),
            ])
            ->defaultSort('total_amount', 'desc')
            ->paginated([10, 25, 50])
            ->emptyStateHeading('Нет данных по курьерам')
            ->emptyStateDescription('Статистика по курьерам появится после завершения первых доставок')
            ->emptyStateIcon('heroicon-o-truck');
    }
}


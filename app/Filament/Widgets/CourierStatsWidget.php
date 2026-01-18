<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\DB;

class CourierStatsWidget extends BaseWidget
{
    protected static ?int $sort = 5;
    protected int | string | array $columnSpan = [
        'md' => 2,
        'xl' => 1,
    ];

    public function getTableRecordKey($record): string
    {
        return $record->courier;
    }

    public function table(Table $table): Table
    {
        return $table
            ->heading('Статистика по курьерам')
            ->query(
                DB::table('orders')
                    ->select([
                        'courier',
                        DB::raw('courier as id'), // Используем courier как id
                        DB::raw('COUNT(*) as orders_count'),
                        DB::raw('SUM(total) as total_amount')
                    ])
                    ->where('status', OrderStatus::COMPLETED->value)
                    ->whereNotNull('courier')
                    ->where('courier', '!=', '')
                    ->groupBy('courier')
                    ->orderBy('total_amount', 'desc')
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
            ->paginated([10, 25, 50])
            ->emptyStateHeading('Нет данных по курьерам')
            ->emptyStateDescription('Статистика по курьерам появится после завершения первых доставок')
            ->emptyStateIcon('heroicon-o-truck');
    }
}


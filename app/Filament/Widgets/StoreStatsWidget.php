<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Store;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Database\Eloquent\Builder;

class StoreStatsWidget extends BaseWidget
{
    protected static ?int $sort = 4;
    protected int | string | array $columnSpan = [
        'md' => 2,
        'xl' => 1,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->heading('Статистика по магазинам')
            ->query(
                Store::query()
                    ->with('city')
                    ->withCount([
                        'orders as orders_count' => function (Builder $query) {
                            $query->where('status', '!=', OrderStatus::CANCELLED->value);
                        }
                    ])
                    ->withSum([
                        'orders as revenue' => function (Builder $query) {
                            $query->where('status', '!=', OrderStatus::CANCELLED->value);
                        }
                    ], 'total')
            )
            ->columns([
                TextColumn::make('city.name')
                    ->label('Название магазина')
                    ->searchable()
                    ->sortable()
                    ->default('—')
                    ->description(fn ($record) => $record->address),

                TextColumn::make('orders_count')
                    ->label('Кол-во заказов')
                    ->sortable()
                    ->alignCenter()
                    ->badge()
                    ->color('primary')
                    ->default(0),

                TextColumn::make('revenue')
                    ->label('Выручка')
                    ->sortable()
                    ->money('RUB')
                    ->alignEnd()
                    ->default(0),
            ])
            ->defaultSort('revenue', 'desc')
            ->paginated([10, 25, 50])
            ->emptyStateHeading('Нет данных по магазинам')
            ->emptyStateDescription('Статистика по магазинам появится после первых заказов')
            ->emptyStateIcon('heroicon-o-building-storefront');
    }
}


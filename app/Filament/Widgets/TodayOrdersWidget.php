<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Contracts\Support\Htmlable;

class TodayOrdersWidget extends BaseWidget
{
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->heading('Заказы на сегодня')
            ->query(
                Order::query()
                    ->whereDate('delivery_date', today())
                    ->with(['user', 'city', 'deliveryPeriod'])
            )
            ->defaultSort('delivery_time', 'asc')
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('delivery_time')
                    ->label('Время доставки')
                    ->sortable()
                    ->badge()
                    ->color('info')
                    ->formatStateUsing(function ($record) {
                        return $record->deliveryPeriod?->time_range ?? $record->delivery_time ?? '—';
                    }),

                TextColumn::make('user.name')
                    ->label('Заказчик')
                    ->searchable()
                    ->default('—')
                    ->formatStateUsing(function ($record) {
                        return $record->user?->name ?? $record->recipient_name ?? 'Анонимный';
                    }),

                TextColumn::make('city.name')
                    ->label('Город заказа')
                    ->searchable()
                    ->sortable()
                    ->default('—'),

                TextColumn::make('total')
                    ->label('Сумма заказа')
                    ->sortable()
                    ->money('RUB')
                    ->alignEnd(),

                TextColumn::make('status')
                    ->label('Статус заказа')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => OrderStatus::from($state)->label())
                    ->color(fn (string $state): string => OrderStatus::from($state)->color()),
            ])
            ->paginated([10, 25, 50])
            ->poll('30s')
            ->emptyStateHeading('Нет заказов на сегодня')
            ->emptyStateDescription('Заказы с доставкой на сегодня будут отображаться здесь')
            ->emptyStateIcon('heroicon-o-calendar');
    }
}


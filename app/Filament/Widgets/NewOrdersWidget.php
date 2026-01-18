<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Contracts\Support\Htmlable;

class NewOrdersWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->heading('Новые заказы')
            ->query(
                Order::query()
                    ->where('status', OrderStatus::NEW->value)
                    ->with(['user', 'city', 'deliveryPeriod'])
                    ->latest()
            )
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('user.name')
                    ->label('Заказчик')
                    ->searchable()
                    ->default('—')
                    ->formatStateUsing(function ($record) {
                        return $record->user?->name ?? $record->recipient_name ?? 'Анонимный';
                    }),

                TextColumn::make('delivery_date')
                    ->label('Дата доставки')
                    ->date('d.m.Y')
                    ->sortable()
                    ->default('—'),

                TextColumn::make('delivery_time')
                    ->label('Время доставки')
                    ->badge()
                    ->color('info')
                    ->formatStateUsing(function ($record) {
                        return $record->deliveryPeriod?->time_range ?? $record->delivery_time ?? '—';
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
            ->emptyStateHeading('Нет новых заказов')
            ->emptyStateDescription('Все новые заказы будут отображаться здесь')
            ->emptyStateIcon('heroicon-o-shopping-bag');
    }
}


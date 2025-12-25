<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('order_number')
                    ->label('№')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Заказчик')
                    ->searchable()
                    ->default('—'),
                TextColumn::make('city.name')
                    ->label('Город')
                    ->toggleable(),
                TextColumn::make('total')
                    ->label('Сумма')
                    ->money('RUB')
                    ->sortable(),
                TextColumn::make('status')
                    ->label('Статус')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => OrderStatus::tryFrom($state)?->label() ?? $state)
                    ->color(fn (string $state) => OrderStatus::tryFrom($state)?->color() ?? 'gray'),
                TextColumn::make('created_at')
                    ->label('Дата')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Статус')
                    ->options(OrderStatus::options()),
                SelectFilter::make('payment_type')
                    ->label('Тип оплаты')
                    ->options(PaymentType::options()),
                SelectFilter::make('city_id')
                    ->label('Город')
                    ->relationship('city', 'name'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}


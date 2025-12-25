<?php

namespace App\Filament\Resources\PromoCodes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PromoCodesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('code')
                    ->label('Код')
                    ->searchable()
                    ->copyable()
                    ->weight('bold'),
                TextColumn::make('usage_count')
                    ->label('Использовано')
                    ->formatStateUsing(fn ($record) => $record->usage_count . '/' . ($record->usage_limit ?? '∞'))
                    ->sortable(),
                TextColumn::make('discount_amount')
                    ->label('Скидка ₽')
                    ->numeric()
                    ->sortable()
                    ->money('RUB')
                    ->placeholder('-'),
                TextColumn::make('discount_percent')
                    ->label('Скидка %')
                    ->numeric()
                    ->sortable()
                    ->suffix('%')
                    ->placeholder('-'),
                TextColumn::make('valid_from')
                    ->label('Срок действия')
                    ->formatStateUsing(function ($record) {
                        $from = $record->valid_from?->format('d.m.Y') ?? '-';
                        $until = $record->valid_until?->format('d.m.Y') ?? '-';
                        return $from . ' — ' . $until;
                    })
                    ->sortable(),
                IconColumn::make('is_active')
                    ->label('Статус')
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('is_active')
                    ->label('Статус')
                    ->options([
                        '1' => 'Активен',
                        '0' => 'Неактивен',
                    ]),
            ])
            ->recordActions([
                EditAction::make()
                    ->label(''),
                DeleteAction::make()->label(''),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}

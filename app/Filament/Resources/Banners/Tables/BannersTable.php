<?php

namespace App\Filament\Resources\Banners\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class BannersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->columns([
                ImageColumn::make('image')
                    ->label('Изображение')
                    ->square()
                    ->circular()
                    ->disk('public')
                    ->visibility('public')
                    ->size(60),
                TextColumn::make('name')
                    ->label('Название')
                    ->searchable(),
                TextColumn::make('city.name')
                    ->label('Город')
                    ->placeholder('Все города')
                    ->searchable(),
                TextColumn::make('start_date')
                    ->label('Период показа')
                    ->formatStateUsing(function ($record) {
                        $from = $record->start_date?->format('d.m.Y') ?? '-';
                        $until = $record->end_date?->format('d.m.Y') ?? '-';
                        return $from . ' — ' . $until;
                    })
                    ->sortable(),
                TextColumn::make('sort_order')
                    ->label('Порядок')
                    ->numeric()
                    ->sortable(),
                IconColumn::make('is_active')
                    ->label('Статус')
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('city_id')
                    ->label('Город')
                    ->relationship('city', 'name'),
                SelectFilter::make('is_active')
                    ->label('Статус')
                    ->options([
                        '1' => 'Активен',
                        '0' => 'Неактивен',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()->label(''),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}

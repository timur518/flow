<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->columns([
                ImageColumn::make('images.image')
                    ->label('Фото')
                    ->disk('public')
                    ->getStateUsing(fn ($record) => $record->images->first()?->image)
                    ->size(50)
                    ->circular(),
                TextColumn::make('name')
                    ->label('Название')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('categories.name')
                    ->label('Категории')
                    ->badge()
                    ->searchable(),
                TextColumn::make('price')
                    ->label('Цена')
                    ->sortable()
                    ->formatStateUsing(function ($state, $record) {
                        $price = number_format($state, 0, ',', ' ') . ' ₽';
                        if ($record->sale_price) {
                            $salePrice = number_format($record->sale_price, 0, ',', ' ') . ' ₽';
                            return "{$salePrice} / {$price}";
                        }
                        return $price;
                    }),
                TextColumn::make('cities.name')
                    ->label('Города')
                    ->badge()
                    ->color('info')
                    ->searchable(),
                TextColumn::make('tags.name')
                    ->label('Теги')
                    ->badge()
                    ->color('gray')
                    ->toggleable(),
                IconColumn::make('is_active')
                    ->label('Статус')
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('categories')
                    ->label('Категория')
                    ->relationship('categories', 'name'),
                SelectFilter::make('cities')
                    ->label('Город')
                    ->relationship('cities', 'name'),
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

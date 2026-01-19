<?php

namespace App\Filament\Resources\Cities\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CityForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Название города')
                    ->required()
                    ->maxLength(255),
                TextInput::make('region')
                    ->label('Область/регион')
                    ->placeholder('Белгородская область')
                    ->helperText('Используется для фильтрации адресов в DaData')
                    ->maxLength(255),
                TextInput::make('latitude')
                    ->label('Широта')
                    ->numeric()
                    ->step(0.0000001),
                TextInput::make('longitude')
                    ->label('Долгота')
                    ->numeric()
                    ->step(0.0000001),
                TextInput::make('sort_order')
                    ->label('Номер по порядку')
                    ->required()
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->label('Активен')
                    ->default(true),
            ]);
    }
}

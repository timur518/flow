<?php

namespace App\Filament\Resources\Ingredients\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class IngredientForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('name')
                            ->label('Название цветка')
                            ->required()
                            ->maxLength(255)
                            ->validationMessages([
                                'required' => 'Введите название цветка',
                            ]),
                    ]),

                Section::make('Настройки')
                    ->schema([
//                        TextInput::make('sort_order')
//                            ->label('Порядок сортировки')
//                            ->numeric()
//                            ->default(0),
                        Toggle::make('is_active')
                            ->label('Активен')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }
}

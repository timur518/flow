<?php

namespace App\Filament\Resources\Tags\Schemas;

use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TagForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('name')
                            ->label('Название тега')
                            ->required()
                            ->maxLength(255)
                            ->validationMessages([
                                'required' => 'Введите название тега',
                            ]),
                        ColorPicker::make('color')
                            ->label('Цвет тега')
                            ->required()
                            ->default('#000000')
                            ->validationMessages([
                                'required' => 'Выберите цвет тега',
                            ]),
                    ]),

                Section::make('Настройки')
                    ->schema([
                        TextInput::make('sort_order')
                            ->label('Порядок сортировки')
                            ->numeric()
                            ->default(0),
                        Toggle::make('is_active')
                            ->label('Активен')
                            ->default(true),
                    ])
                    ->columns(1),
            ]);
    }
}

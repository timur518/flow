<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Models\Ingredient;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Товар')
                    ->tabs([
                        Tabs\Tab::make('Основная информация')
                            ->schema([
                                Select::make('categories')
                                    ->label('Категории')
                                    ->relationship('categories', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->searchable()
                                    ->required()
                                    ->validationMessages([
                                        'required' => 'Выберите категорию товара',
                                    ]),
                                Select::make('cities')
                                    ->label('Города')
                                    ->relationship('cities', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->required()
                                    ->validationMessages([
                                        'required' => 'Выберите город',
                                    ])
                                    ->searchable(),
                                Select::make('tags')
                                    ->label('Теги товара')
                                    ->relationship('tags', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->searchable(),
                                TextInput::make('name')
                                    ->label('Название товара')
                                    ->required()
                                    ->maxLength(255)
                                    ->columnSpanFull()
                                    ->validationMessages([
                                        'required' => 'Введите название товара',
                                    ]),
                                RichEditor::make('description')
                                    ->label('Текстовое описание')
                                    ->columnSpanFull(),
                                TextInput::make('price')
                                    ->label('Стоимость')
                                    ->required()
                                    ->numeric()
                                    ->minValue(0)
                                    ->suffix('₽')
                                    ->validationMessages([
                                        'required' => 'Введите стоимость товара',
                                    ]),
                                TextInput::make('sale_price')
                                    ->label('Цена со скидкой')
                                    ->numeric()
                                    ->minValue(0)
                                    ->suffix('₽'),
                                TextInput::make('width')
                                    ->label('Ширина')
                                    ->numeric()
                                    ->minValue(0)
                                    ->suffix('см'),
                                TextInput::make('height')
                                    ->label('Высота')
                                    ->numeric()
                                    ->minValue(0)
                                    ->suffix('см'),
                                Toggle::make('is_active')
                                    ->label('Статус')
                                    ->default(true),
                            ])
                            ->columns(2),

                        Tabs\Tab::make('Состав')
                            ->schema([
                                Repeater::make('composition')
                                    ->label('Выберите, что входит в состав')
                                    ->schema([
                                        Select::make('ingredient_id')
                                            ->label('Составник')
                                            ->options(Ingredient::where('is_active', true)->pluck('name', 'id'))
                                            ->required()
                                            ->searchable(),
                                        TextInput::make('quantity')
                                            ->label('Кол-во')
                                            ->numeric()
                                            ->default(1)
                                            ->required(),
                                    ])
                                    ->columns(2)
                                    ->defaultItems(0)
                                    ->addActionLabel('Добавить составник')
                                    ->reorderable()
                                    ->collapsible(),
                            ]),

                        Tabs\Tab::make('Фотографии')
                            ->schema([
                                FileUpload::make('images')
                                    ->label('Загрузка фотографий')
                                    ->image()
                                    ->multiple()
                                    ->disk('public')
                                    ->directory('products')
                                    ->visibility('public')
                                    ->reorderable()
                                    ->imageEditor(),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}

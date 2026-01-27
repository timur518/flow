<?php

namespace App\Filament\Resources\Banners\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class BannerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Изображение')
                    ->schema([
                        FileUpload::make('image')
                            ->label('Изображение баннера')
                            ->image()
                            ->required()
                            ->disk('public')
                            ->directory('banners')
                            ->visibility('public')
                            ->imageEditor()
                            ->helperText('Рекомендуемый формат 3:4')
                            ->validationMessages([
                                'required' => 'Загрузите изображение баннера',
                            ]),
                        TextInput::make('link_url')
                            ->label('Ссылка на баннере')
                            ->placeholder('/products/123 или /categories/roses')
                            ->helperText('Внутренняя ссылка для перехода при клике на баннер (например: /products/123, /categories/roses)')
                            ->maxLength(500),
                    ]),

                Section::make('Настройки')
                    ->schema([
                        TextInput::make('name')
                            ->label('Название баннера')
                            ->required()
                            ->maxLength(255)
                            ->helperText('Для админов, не видно покупателям')
                            ->validationMessages([
                                'required' => 'Введите название баннера',
                            ]),
                        Select::make('city_id')
                            ->label('Город')
                            ->relationship('city', 'name')
                            ->preload()
                            ->searchable()
                            ->placeholder('Все города'),
                        TextInput::make('sort_order')
                            ->label('Номер по порядку')
                            ->required()
                            ->numeric()
                            ->default(0)
                            ->validationMessages([
                                'required' => 'Укажите порядок сортировки',
                                'numeric' => 'Введите число',
                            ]),
                    ])
                    ->columns(1),

                Section::make('Период показа')
                    ->schema([
                        DatePicker::make('start_date')
                            ->label('Дата начала показа')
                            ->native(false)
                            ->displayFormat('d.m.Y'),
                        DatePicker::make('end_date')
                            ->label('Дата завершения показа')
                            ->native(false)
                            ->displayFormat('d.m.Y')
                            ->afterOrEqual('start_date')
                            ->validationMessages([
                                'after_or_equal' => 'Дата завершения должна быть не раньше даты начала',
                            ]),
                        Toggle::make('is_active')
                            ->label('Активен')
                            ->default(true),
                    ])
                    ->columns(1),
            ]);
    }
}

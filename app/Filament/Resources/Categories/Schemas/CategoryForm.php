<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Основная информация')
                    ->schema([
                        FileUpload::make('image')
                            ->label('Обложка категории')
                            ->image()
                            ->disk('public')
                            ->directory('categories')
                            ->visibility('public')
                            ->imageEditor()
                            ->helperText('Необязательно'),
                        TextInput::make('name')
                            ->label('Название')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set, $get) =>
                                $get('slug') === null || $get('slug') === '' ?
                                    $set('slug', Str::slug($state)) : null
                            )
                            ->validationMessages([
                                'required' => 'Введите название категории',
                            ]),
                        TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255)
                            ->helperText('URL-адрес категории (генерируется автоматически)')
                            ->validationMessages([
                                'required' => 'Slug обязателен',
                                'unique' => 'Такой slug уже существует',
                            ]),
                    ]),

                Section::make('Настройки')
                    ->schema([
                        TextInput::make('sort_order')
                            ->label('Порядок сортировки')
                            ->numeric()
                            ->default(0)
                            ->validationMessages([
                                'numeric' => 'Введите число',
                            ]),
                        Toggle::make('is_active')
                            ->label('Активна')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }
}

<?php

namespace App\Filament\Resources\PromoCodes\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PromoCodeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Основная информация')
                    ->schema([
                        TextInput::make('code')
                            ->label('Код промокода')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->alphaDash()
                            ->maxLength(50)
                            ->helperText('Только английские буквы, цифры, дефис и подчёркивание')
                            ->validationMessages([
                                'required' => 'Код промокода обязателен',
                                'unique' => 'Такой промокод уже существует',
                                'alpha_dash' => 'Код может содержать только буквы, цифры, дефис и подчёркивание',
                                'max' => 'Код не должен превышать 50 символов',
                            ]),
                        TextInput::make('usage_limit')
                            ->label('Количество использований')
                            ->numeric()
                            ->minValue(1)
                            ->helperText('Оставьте пустым для неограниченного использования')
                            ->validationMessages([
                                'numeric' => 'Введите число',
                                'min' => 'Минимальное значение: 1',
                            ]),
                    ])
                    ->columns(1),

                Section::make('Размер скидки')
                    ->schema([
                        TextInput::make('discount_amount')
                            ->label('Скидка в рублях')
                            ->numeric()
                            ->prefix('₽')
                            ->minValue(0)
                            ->validationMessages([
                                'numeric' => 'Введите число',
                                'min' => 'Скидка не может быть отрицательной',
                            ]),
                        TextInput::make('discount_percent')
                            ->label('Скидка в %')
                            ->numeric()
                            ->prefix('%')
                            ->minValue(0)
                            ->maxValue(100)
                            ->helperText('⚠️ Может быть указана только одна из двух скидок!!!')
                            ->validationMessages([
                                'numeric' => 'Введите число',
                                'min' => 'Скидка не может быть отрицательной',
                                'max' => 'Скидка не может превышать 100%',
                            ]),
                    ])
                    ->columns(1),

                Section::make('Срок действия')
                    ->schema([
                        DatePicker::make('valid_from')
                            ->label('Срок действия (от)')
                            ->native(false)
                            ->displayFormat('d.m.Y'),
                        DatePicker::make('valid_until')
                            ->label('Срок действия (до)')
                            ->native(false)
                            ->displayFormat('d.m.Y')
                            ->afterOrEqual('valid_from')
                            ->validationMessages([
                                'after_or_equal' => 'Дата окончания должна быть не раньше даты начала',
                            ]),
                        Toggle::make('is_active')
                            ->label('Активен')
                            ->default(true),
                    ])
                    ->columns(2),
            ]);
    }
}

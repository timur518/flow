<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Models\City;
use App\Models\Product;
use App\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderForm
{
    /**
     * Пересчитывает subtotal и total заказа на основе items (для вызова из Repeater)
     * Всегда вычисляет на основе price * quantity, не полагаясь на total item
     */
    public static function recalculateTotals(?array $items, callable $set, ?float $discount = null): void
    {
        $subtotal = 0;
        if ($items) {
            foreach ($items as $item) {
                $price = (float) ($item['price'] ?? 0);
                $quantity = (int) ($item['quantity'] ?? 1);
                $subtotal += $price * $quantity;
            }
        }
        $set('subtotal', $subtotal);
        $set('total', $subtotal - ($discount ?? 0));
    }

    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Общая информация')
                    ->schema([
                        TextInput::make('order_number')
                            ->label('Номер заказа')
                            ->required()
                            ->dehydrated(),
                        Select::make('status')
                            ->label('Статус заказа')
                            ->options(OrderStatus::options())
                            ->required()
                            ->default('new'),
                        Select::make('payment_type')
                            ->label('Тип оплаты')
                            ->options(PaymentType::options())
                            ->required()
                            ->default('on_delivery'),
                        TextInput::make('promo_code')
                            ->label('Промокод'),
                        TextInput::make('courier')
                            ->label('Курьер'),
                    ])
                    ->columns(2),

                Section::make('Заказчик')
                    ->schema([
                        Select::make('user_id')
                            ->label('Пользователь')
                            ->options(User::pluck('name', 'id'))
                            ->searchable()
                            ->preload(),
                        TextInput::make('customer_phone')
                            ->label('Телефон'),
                        Toggle::make('is_anonymous')
                            ->label('Анонимный заказ')
                            ->default(false),
                    ])
                    ->columns(1),

                Section::make('Получатель заказа')
                    ->schema([
                        TextInput::make('recipient_name')
                            ->label('ФИО получателя'),
                        TextInput::make('recipient_phone')
                            ->label('Телефон получателя')
                            ->tel(),
                        TextInput::make('recipient_social')
                            ->label('Ссылка на соц-сеть получателя'),
                    ])
                    ->columns(1),

                Section::make('Информация о доставке')
                    ->schema([
                        Select::make('city_id')
                            ->label('Город')
                            ->options(City::where('is_active', true)->pluck('name', 'id'))
                            ->searchable()
                            ->preload(),
                        Select::make('delivery_type')
                            ->label('Тип доставки')
                            ->options(DeliveryType::options())
                            ->default('delivery'),
                        TextInput::make('delivery_address')
                            ->label('Адрес доставки')
                            ->columnSpanFull(),
                        DatePicker::make('delivery_date')
                            ->label('Дата получения заказа'),
                        TextInput::make('delivery_time')
                            ->label('Время получения заказа'),
                    ])
                    ->columns(2),

                Section::make('Список товаров')
                    ->schema([
                        Repeater::make('items')
                            ->label('')
                            ->relationship()
                            ->mutateRelationshipDataBeforeCreateUsing(function (array $data): array {
                                $data['total'] = ($data['price'] ?? 0) * ($data['quantity'] ?? 1);
                                return $data;
                            })
                            ->mutateRelationshipDataBeforeSaveUsing(function (array $data): array {
                                $data['total'] = ($data['price'] ?? 0) * ($data['quantity'] ?? 1);
                                return $data;
                            })
                            ->live()
                            ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                $discount = $get('discount') ?: 0;
                                self::recalculateTotals($state, $set, $discount);
                            })
                            ->schema([
                                Select::make('product_id')
                                    ->label('Товар')
                                    ->options(Product::where('is_active', true)->pluck('name', 'id'))
                                    ->searchable()
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                        if ($state) {
                                            $product = Product::find($state);
                                            if ($product) {
                                                $set('product_name', $product->name);
                                                $price = $product->sale_price ?? $product->price;
                                                $set('price', $price);
                                                $quantity = $get('quantity') ?: 1;
                                                $set('total', $price * $quantity);
                                            }
                                        }
                                    }),
                                TextInput::make('quantity')
                                    ->label('Кол-во')
                                    ->numeric()
                                    ->default(1)
                                    ->required()
                                    ->minValue(1)
                                    ->live(debounce: 500)
                                    ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                        $price = $get('price') ?: 0;
                                        $quantity = $state ?: 1;
                                        $set('total', $price * $quantity);
                                    }),
                                TextInput::make('price')
                                    ->label('Цена')
                                    ->numeric()
                                    ->required()
                                    ->suffix('₽')
                                    ->live(debounce: 500)
                                    ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                        $price = $state ?: 0;
                                        $quantity = $get('quantity') ?: 1;
                                        $set('total', $price * $quantity);
                                    }),
                                TextInput::make('total')
                                    ->label('Сумма')
                                    ->numeric()
                                    ->suffix('₽')
                                    ->disabled()
                                    ->dehydrated(),
                            ])
                            ->columns(4)
                            ->defaultItems(0)
                            ->addActionLabel('Добавить товар')
                            ->reorderable(false),
                    ])
                    ->columnSpanFull(),

                Section::make('Итого')
                    ->schema([
                        TextInput::make('subtotal')
                            ->label('Сумма заказа')
                            ->numeric()
                            ->suffix('₽')
                            ->disabled()
                            ->dehydrated(),
                        TextInput::make('delivery_cost')
                            ->label('Стоимость доставки')
                            ->numeric()
                            ->suffix('₽')
                            ->default(0),
                        TextInput::make('discount')
                            ->label('Скидка по промокоду')
                            ->numeric()
                            ->suffix('₽')
                            ->default(0)
                            ->live()
                            ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                $subtotal = $get('subtotal') ?: 0;
                                $discount = $state ?: 0;
                                $set('total', $subtotal - $discount);
                            }),
                        TextInput::make('total')
                            ->label('Итого')
                            ->numeric()
                            ->suffix('₽')
                            ->disabled()
                            ->dehydrated(),
                    ])
                    ->columns(4),
            ]);
    }
}


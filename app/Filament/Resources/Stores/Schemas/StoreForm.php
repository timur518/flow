<?php

namespace App\Filament\Resources\Stores\Schemas;

use App\Enums\VatCode;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class StoreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Магазин')
                    ->tabs([
                        Tab::make('Основная информация')
                            ->schema([
                                Select::make('city_id')
                                    ->label('Город')
                                    ->relationship('city', 'name')
                                    ->required()
                                    ->preload()
                                    ->searchable(),
                                TextInput::make('address')
                                    ->label('Адрес полный')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('phone')
                                    ->label('Телефон магазина')
                                    ->mask('+7 (999) 999-99-99')
                                    ->placeholder('+7 (___) ___-__-__'),
                                TextInput::make('email')
                                    ->label('E-mail магазина')
                                    ->email(),
                                TextInput::make('whatsapp_url')
                                    ->label('WhatsApp магазина')
                                    ->url()
                                    ->placeholder('https://wa.me/...'),
                                TextInput::make('telegram_chat_url')
                                    ->label('Telegram-чат магазина')
                                    ->url()
                                    ->placeholder('https://t.me/...'),
                                TextInput::make('telegram_channel_url')
                                    ->label('Telegram канал')
                                    ->url()
                                    ->placeholder('https://t.me/...'),
                                TextInput::make('max_chat_url')
                                    ->label('Max-чат')
                                    ->url(),
                                TextInput::make('max_group_url')
                                    ->label('Max группа')
                                    ->url(),
                                TextInput::make('instagram_url')
                                    ->label('Instagram страница')
                                    ->url()
                                    ->placeholder('https://instagram.com/...'),
                                TextInput::make('vk_url')
                                    ->label('VK группа')
                                    ->url()
                                    ->placeholder('https://vk.com/...'),
                                TextInput::make('telegram_chat_id')
                                    ->label('Telegram ChatID для уведомлений'),
                                Toggle::make('is_active')
                                    ->label('Активен')
                                    ->default(true),
                                TextInput::make('sort_order')
                                    ->label('Порядок сортировки')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->columns(2),

                        Tab::make('Координаты')
                            ->schema([
                                TextInput::make('latitude')
                                    ->label('Широта')
                                    ->numeric()
                                    ->step(0.0000001),
                                TextInput::make('longitude')
                                    ->label('Долгота')
                                    ->numeric()
                                    ->step(0.0000001),
                                TextInput::make('yandex_maps_url')
                                    ->label('Ссылка на Яндекс Карты')
                                    ->url()
                                    ->columnSpanFull(),
                                Textarea::make('yandex_maps_code')
                                    ->label('Код Яндекс Карты')
                                    ->rows(4)
                                    ->columnSpanFull(),
                            ])
                            ->columns(2),

                        Tab::make('Доставка')
                            ->schema([
                                Section::make('Периоды доставки')
                                    ->schema([
                                        Repeater::make('deliveryPeriods')
                                            ->label('')
                                            ->relationship()
                                            ->schema([
                                                TextInput::make('time_range')
                                                    ->label('Время доставки')
                                                    ->required()
                                                    ->placeholder('09:00 - 12:00'),
                                                TextInput::make('sort_order')
                                                    ->label('Порядок')
                                                    ->numeric()
                                                    ->default(0),
                                            ])
                                            ->columns(2)
                                            ->reorderable()
                                            ->collapsible()
                                            ->defaultItems(0)
                                            ->addActionLabel('Добавить период'),
                                    ]),
                                Section::make('Зоны доставки')
                                    ->schema([
                                        Repeater::make('deliveryZones')
                                            ->label('')
                                            ->relationship()
                                            ->schema([
                                                TextInput::make('name')
                                                    ->label('Название зоны')
                                                    ->required(),
                                                Textarea::make('polygon_coordinates')
                                                    ->label('Координаты полигона')
                                                    ->rows(3)
                                                    ->helperText('JSON массив координат'),
                                                TextInput::make('delivery_cost')
                                                    ->label('Стоимость доставки')
                                                    ->numeric()
                                                    ->prefix('₽')
                                                    ->default(0),
                                                TextInput::make('min_free_delivery_amount')
                                                    ->label('Мин. сумма бесплатной доставки')
                                                    ->numeric()
                                                    ->prefix('₽'),
//                                                TextInput::make('sort_order')
//                                                    ->label('Порядок')
//                                                    ->numeric()
//                                                    ->default(0),
                                            ])
                                            ->columns(2)
                                            ->reorderable()
                                            ->collapsible()
                                            ->defaultItems(0)
                                            ->addActionLabel('Добавить зону'),
                                    ]),
                            ]),

                        Tab::make('Юр. лицо')
                            ->schema([
                                TextInput::make('legal_name')
                                    ->label('Название')
                                    ->maxLength(255),
                                TextInput::make('inn')
                                    ->label('ИНН')
                                    ->maxLength(12)
                                    ->tel()
                                    ->telRegex('/^[0-9]+$/')
                                    ->helperText('Только цифры, до 12 символов'),
                                TextInput::make('ogrn')
                                    ->label('ОГРН')
                                    ->maxLength(15)
                                    ->tel()
                                    ->telRegex('/^[0-9]+$/')
                                    ->helperText('Только цифры, до 15 символов'),
                                TextInput::make('legal_address')
                                    ->label('Юр. адрес')
                                    ->maxLength(255)
                                    ->columnSpanFull(),
                            ])
                            ->columns(2),

                        Tab::make('Платежи')
                            ->schema([
                                Toggle::make('orders_blocked')
                                    ->label('Блокировка заказов')
                                    ->default(false)
                                    ->columnSpanFull(),
                                Toggle::make('payment_on_delivery')
                                    ->label('Оплата при получении')
                                    ->default(true),
                                Toggle::make('payment_online')
                                    ->label('Оплата онлайн')
                                    ->default(true),
                                Select::make('vat_code')
                                    ->label('Ставка НДС')
                                    ->options(VatCode::options())
                                    ->placeholder('Выберите ставку НДС')
                                    ->columnSpanFull(),
                                TextInput::make('yookassa_shop_id')
                                    ->label('ShopID YooKassa')
                                    ->numeric(),
                                TextInput::make('yookassa_secret_key')
                                    ->label('Secret Key YooKassa')
                                    ->password()
                                    ->revealable(),
                            ])
                            ->columns(2),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}

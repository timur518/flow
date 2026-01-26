<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Filament\Resources\Orders\OrderResource;
use Filament\Actions\EditAction;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\RepeatableEntry\TableColumn;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Support\Enums\TextSize;
use Filament\Support\Enums\FontWeight;
use Filament\Schemas\Schema;


class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    public function getTitle(): string
    {
        return 'Заказ #' . $this->record->order_number;
    }

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }

    public function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Общая информация')
                    ->schema([
                        TextEntry::make('order_number')
                            ->label('Номер заказа'),
                        TextEntry::make('status')
                            ->label('Статус заказа')
                            ->badge()
                            ->formatStateUsing(fn (string $state) => OrderStatus::tryFrom($state)?->label() ?? $state)
                            ->color(fn (string $state) => OrderStatus::tryFrom($state)?->color() ?? 'gray'),
                        TextEntry::make('created_at')
                            ->label('Дата оформления')
                            ->dateTime('d.m.Y H:i'),
                        TextEntry::make('payment_type')
                            ->label('Тип оплаты')
                            ->badge()
                            ->color('success')
                            ->icon('heroicon-o-credit-card')
                            ->formatStateUsing(fn (string $state) => PaymentType::tryFrom($state)?->label() ?? $state),
                        TextEntry::make('promo_code')
                            ->label('Промокод')
                            ->badge()
                            ->color('info')
                            ->icon('heroicon-o-ticket')
                            ->placeholder('—'),
                        TextEntry::make('courier')
                            ->label('Курьер')
                            ->badge()
                            ->color('gray')
                            ->icon('heroicon-o-truck')
                            ->placeholder('—'),
                    ])
                    ->columns(6)
                    ->columnSpanFull(),

                Section::make('Информация о доставке')
                    ->schema([
                        TextEntry::make('city.name')
                            ->label('Город')
                            ->badge()
                            ->color('info')
                            ->placeholder('—'),
                        TextEntry::make('delivery_address')
                            ->label('Адрес доставки')
                            ->badge()
                            ->color('info')
                            ->icon('heroicon-o-map-pin')
                            ->copyable()
                            ->placeholder('—')
                            ->columnSpan(2),
                        TextEntry::make('delivery_type')
                            ->label('Тип доставки')
                            ->badge()
                            ->color('gray')
                            ->icon('heroicon-o-truck')
                            ->formatStateUsing(fn (?string $state) => $state ? (DeliveryType::tryFrom($state)?->label() ?? $state) : '—'),
                        TextEntry::make('delivery_date')
                            ->label('Дата получения')
                            ->date('d.m.Y')
                            ->badge()
                            ->color('warning')
                            ->icon('heroicon-o-calendar')
                            ->placeholder('—'),
                        TextEntry::make('delivery_time')
                            ->label('Время получения')
                            ->badge()
                            ->color('warning')
                            ->icon('heroicon-o-clock')
                            ->placeholder('—'),
                    ])
                    ->columns(6)
                    ->columnSpanFull(),

                Section::make('Заказчик')
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('Имя')
                            ->placeholder('—'),
                        TextEntry::make('user.email')
                            ->label('Email')
                            ->placeholder('—'),
                        TextEntry::make('customer_phone')
                            ->label('Телефон')
                            ->badge()
                            ->color('info')
                            ->icon('heroicon-o-phone')
                            ->copyable()
                            ->placeholder('—'),
                        TextEntry::make('is_anonymous')
                            ->label('Анонимный заказ')
                            ->badge()
                            ->color('danger')
                            ->icon('heroicon-o-user')
                            ->formatStateUsing(fn (bool $state) => $state ? 'Да' : 'Нет'),
                    ])
                    ->columns(2),

                Section::make('Получатель заказа')
                    ->schema([
                        TextEntry::make('recipient_name')
                            ->label('ФИО получателя')
                            ->badge()
                            ->color('info')
                            ->icon('heroicon-o-user')
                            ->placeholder('—'),
                        TextEntry::make('recipient_phone')
                            ->label('Телефон получателя')
                            ->badge()
                            ->color('info')
                            ->copyable()
                            ->icon('heroicon-o-phone')
                            ->placeholder('—'),
                        TextEntry::make('recipient_social')
                            ->label('Cоц-сеть получателя')
                            ->placeholder('—'),
                    ])
                    ->columns(2),

                Section::make('Список товаров')
                    ->schema([
                        RepeatableEntry::make('items')
                            ->label('')
                            ->table([
                                TableColumn::make('ID')->width('60px'),
                                TableColumn::make('Превью')->width('70px'),
                                TableColumn::make('Название товара')->width('200px'),
                                TableColumn::make('Кол-во')->width('80px'),
                                TableColumn::make('Стоимость')->width('100px'),
                                TableColumn::make('Сумма')->width('100px'),
                            ])
                            ->schema([
                                TextEntry::make('product_id'),
                                ImageEntry::make('product.images.image')
                                    ->disk('public')
                                    ->getStateUsing(fn ($record) => $record->product?->images->first()?->image)
                                    ->circular()
                                    ->size(50),
                                TextEntry::make('product_name'),
                                TextEntry::make('quantity'),
                                TextEntry::make('price')
                                    ->money('RUB'),
                                TextEntry::make('total')
                                    ->money('RUB'),
                            ]),
                    ])
                    ->extraAttributes([
                        'class' => 'overflow-x-auto -mx-4 px-4',
                    ])
                    ->columnSpanFull(),

                // Итого — всегда видно, выделено
                Section::make()
                    ->schema([
                        Grid::make(['default' => 1, 'md' => 4])
                            ->schema([
                                TextEntry::make('subtotal')
                                    ->label('Сумма товаров')
                                    ->money('RUB')
                                    ->size(TextSize::Medium),
                                TextEntry::make('discount')
                                    ->label('Скидка')
                                    ->money('RUB')
                                    ->size(TextSize::Medium)
                                    ->color('danger')
                                    ->formatStateUsing(fn ($state) => $state > 0 ? "-{$state}" : '0'),
                                TextEntry::make('delivery_cost')
                                    ->label('Доставка')
                                    ->money('RUB')
                                    ->size(TextSize::Medium)
                                    ->color('info'),
                                TextEntry::make('total')
                                    ->label('Итого к оплате')
                                    ->money('RUB')
                                    ->size(TextSize::Large)
                                    ->weight(FontWeight::Bold)
                                    ->color('success'),
                            ]),
                    ])->columnSpanFull(),
            ]);
    }
}

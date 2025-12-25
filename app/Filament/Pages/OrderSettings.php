<?php

namespace App\Filament\Pages;

use App\Models\Category;
use App\Models\OrderSetting;
use App\Services\TelegramService;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class OrderSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-shopping-cart';
    protected static ?string $navigationLabel = 'Настройки заказов';
    protected static ?string $title = 'Настройки заказов';
    protected static string|\UnitEnum|null $navigationGroup = 'Настройки';
    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.order-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $settings = OrderSetting::first();

        if (!$settings) {
            $settings = OrderSetting::create([]);
        }

        $this->form->fill($settings->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Tabs::make('Настройки заказов')
                    ->tabs([
                        Tab::make('Управление ценами')
                            ->icon('heroicon-o-currency-dollar')
                            ->schema([
                                Section::make('Массовое изменение цен товаров')
                                    ->description('Настройки изменения цен будут применяться на фронтенде при отображении товаров')
                                    ->schema([
                                        Toggle::make('bulk_price_change_enabled')
                                            ->label('Активировать массовое изменение цен')
                                            ->helperText('Включите для применения изменения цен на фронтенде')
                                            ->live(),

                                        TextInput::make('price_change_percentage')
                                            ->label('Процент изменения цены')
                                            ->suffix('%')
                                            ->numeric()
                                            ->helperText('Положительное число увеличит цены, отрицательное - уменьшит. Например: 10 или -15')
                                            ->placeholder('Например: 10 или -15')
                                            ->visible(fn ($get) => $get('bulk_price_change_enabled')),

                                        Select::make('selected_category_ids')
                                            ->label('Применить к категориям')
                                            ->options(Category::where('is_active', true)->pluck('name', 'id'))
                                            ->multiple()
                                            ->searchable()
                                            ->placeholder('Все товары')
                                            ->helperText('Оставьте пустым для применения ко всем товарам')
                                            ->visible(fn ($get) => $get('bulk_price_change_enabled')),
                                    ]),
                            ]),

                        Tab::make('Telegram уведомления')
                            ->icon('heroicon-o-chat-bubble-left-right')
                            ->schema([
                                Section::make('Настройки Telegram бота')
                                    ->schema([
                                        Toggle::make('telegram_notifications_enabled')
                                            ->label('Включить Telegram уведомления')
                                            ->helperText('Включите для получения уведомлений о заказах в Telegram'),

                                        TextInput::make('telegram_bot_token')
                                            ->label('Telegram Bot Token')
                                            ->placeholder('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz')
                                            ->password()
                                            ->revealable()
                                            ->helperText('Получите токен у @BotFather в Telegram'),

                                        TextInput::make('telegram_chat_ids')
                                            ->label('Telegram Chat ID')
                                            ->placeholder('123456789, 987654321')
                                            ->helperText('ID чатов через запятую. Получите ID у @userinfobot')
                                            ->belowContent(
                                                Action::make('test_telegram')
                                                    ->label('Отправить тестовое сообщение')
                                                    ->color('success')
                                                    ->action(fn () => $this->sendTestTelegramMessage())
                                            ),
                                    ]),
                            ]),

                        Tab::make('Email уведомления')
                            ->icon('heroicon-o-envelope')
                            ->schema([
                                Section::make('Настройки email для клиентов')
                                    ->schema([
                                        Toggle::make('email_new_order_to_customer')
                                            ->label('Отправлять отчет о новом заказе клиенту')
                                            ->helperText('Клиент получит письмо с подтверждением заказа')
                                            ->default(true),

                                        Toggle::make('email_delivery_complete_to_customer')
                                            ->label('Отправлять уведомление о завершенной доставке клиенту')
                                            ->helperText('Клиент получит письмо после доставки заказа')
                                            ->default(true),
                                    ]),

                                Section::make('Настройки email для администратора')
                                    ->schema([
                                        Toggle::make('email_new_order_to_admin')
                                            ->label('Отправлять письмо о новом заказе администратору')
                                            ->helperText('Администратор получит уведомление о каждом новом заказе')
                                            ->default(true),

                                        TextInput::make('admin_email')
                                            ->label('Email администратора для копии заказов')
                                            ->email()
                                            ->placeholder('admin@example.com')
                                            ->helperText('На этот email будут приходить уведомления о новых заказах'),
                                    ]),
                            ]),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    public function sendTestTelegramMessage(): void
    {
        $token = $this->data['telegram_bot_token'] ?? null;
        $chatIds = $this->data['telegram_chat_ids'] ?? null;

        if (!$token || !$chatIds) {
            Notification::make()
                ->warning()
                ->title('Заполните данные')
                ->body('Укажите Bot Token и Chat ID для отправки тестового сообщения')
                ->send();
            return;
        }

        // Сохраняем настройки перед отправкой
        $this->save();

        // Отправляем тестовое сообщение
        $telegramService = app(TelegramService::class);
        $chatIdsArray = array_map('trim', explode(',', $chatIds));

        $successCount = 0;
        foreach ($chatIdsArray as $chatId) {
            if ($telegramService->sendMessage($chatId, "🧪 <b>Тестовое сообщение</b>\n\nЕсли вы видите это сообщение, значит Telegram бот настроен правильно! ✅")) {
                $successCount++;
            }
        }

        if ($successCount > 0) {
            Notification::make()
                ->success()
                ->title('Сообщение отправлено')
                ->body("Тестовое сообщение успешно отправлено в {$successCount} чат(ов)")
                ->send();
        } else {
            Notification::make()
                ->danger()
                ->title('Ошибка отправки')
                ->body('Не удалось отправить сообщение. Проверьте токен бота и Chat ID')
                ->send();
        }
    }

    public function save(): void
    {
        $data = $this->form->getState();

        $settings = OrderSetting::first();

        if (!$settings) {
            $settings = OrderSetting::create($data);
        } else {
            $settings->update($data);
        }

        Notification::make()
            ->success()
            ->title('Настройки сохранены')
            ->body('Настройки заказов успешно обновлены.')
            ->send();
    }
}

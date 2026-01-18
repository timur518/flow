<?php

namespace App\Filament\Pages;

use App\Models\SiteSetting;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class SiteSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'Общие настройки';
    protected static ?string $title = 'Общие настройки сайта';
    protected static string|\UnitEnum|null $navigationGroup = 'Настройки';
    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.site-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $settings = SiteSetting::first();

        if (!$settings) {
            $settings = SiteSetting::create([]);
        }

        $this->form->fill($settings->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Tabs::make('Настройки')
                    ->tabs([
                        Tab::make('Общие настройки')
                            ->icon('heroicon-o-globe-alt')
                            ->schema([
                                Section::make()
                                    ->schema([
                                        TextInput::make('site_brand')
                                            ->label('Бренд сайта')
                                            ->placeholder('Название вашего сайта')
                                            ->maxLength(255),
                                        TextInput::make('site_domain')
                                            ->label('Домен сайта')
                                            ->placeholder('example.com')
                                            ->url()
                                            ->maxLength(255),
                                    ])
                                    ->columns(2),
                            ]),

                        Tab::make('Внешний вид')
                            ->icon('heroicon-o-paint-brush')
                            ->schema([
                                Section::make()
                                    ->schema([
                                        FileUpload::make('logo_path')
                                            ->label('Логотип')
                                            ->image()
                                            ->directory('site-settings')
                                            ->visibility('public')
                                            ->disk('public')
                                            ->maxSize(3048)
                                            ->acceptedFileTypes(['image/png', 'image/jpeg', 'image/svg+xml'])
                                            ->helperText('Рекомендуемый формат: PNG, SVG. Максимальный размер: 2MB'),
                                        FileUpload::make('favicon_path')
                                            ->label('Favicon')
                                            ->image()
                                            ->directory('site-settings')
                                            ->visibility('public')
                                            ->disk('public')
                                            ->maxSize(2048)
                                            ->acceptedFileTypes(['image/x-icon', 'image/png'])
                                            ->helperText('Рекомендуемый формат: ICO, PNG, SVG. Размер: 32x32px или больше'),
                                        ColorPicker::make('primary_color')
                                            ->label('Акцентный цвет сайта')
                                            ->helperText('Основной цвет вашего бренда'),
                                        ColorPicker::make('secondary_color')
                                            ->label('Вторичный цвет сайта')
                                            ->helperText('Дополнительный цвет для акцентов'),
                                    ])
                                    ->columns(2),
                            ]),

                        Tab::make('Настройки почты')
                            ->icon('heroicon-o-envelope')
                            ->schema([
                                Section::make()
                                    ->schema([
                                        TextInput::make('smtp_host')
                                            ->label('SMTP сервер')
                                            ->placeholder('smtp.example.com')
                                            ->maxLength(255),
                                        TextInput::make('smtp_port')
                                            ->label('SMTP порт')
                                            ->numeric()
                                            ->placeholder('587')
                                            ->minValue(1)
                                            ->maxValue(65535),
                                        TextInput::make('smtp_username')
                                            ->label('SMTP логин')
                                            ->placeholder('user@example.com')
                                            ->maxLength(255),
                                        TextInput::make('smtp_password')
                                            ->label('SMTP пароль')
                                            ->password()
                                            ->revealable()
                                            ->maxLength(255),
                                    ])
                                    ->columns(2),
                            ]),

                        Tab::make('SEO настройки')
                            ->icon('heroicon-o-magnifying-glass')
                            ->schema([
                                Section::make()
                                    ->schema([
                                        TextInput::make('home_title')
                                            ->label('Title главной страницы')
                                            ->placeholder('Заголовок для поисковых систем')
                                            ->maxLength(255)
                                            ->helperText('Рекомендуемая длина: 50-60 символов'),
                                        Textarea::make('home_description')
                                            ->label('Description главной страницы')
                                            ->placeholder('Описание для поисковых систем')
                                            ->rows(3)
                                            ->maxLength(500)
                                            ->helperText('Рекомендуемая длина: 150-160 символов')
                                            ->columnSpanFull(),
                                        Textarea::make('yandex_metrika_code')
                                            ->label('Код Яндекс Метрики')
                                            ->placeholder('<!-- Yandex.Metrika counter -->...')
                                            ->rows(5)
                                            ->helperText('Вставьте полный код счетчика Яндекс.Метрики')
                                            ->columnSpanFull(),
                                        Textarea::make('custom_head_scripts')
                                            ->label('Прочие скрипты в <head>')
                                            ->placeholder('<script>...</script>')
                                            ->rows(5)
                                            ->helperText('Дополнительные скрипты, которые будут добавлены в <head>')
                                            ->columnSpanFull(),
                                    ])
                                    ->columns(2),
                            ]),
                    ])
                    ->columnSpanFull()
                    ->persistTabInQueryString(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        $settings = SiteSetting::first();

        if (!$settings) {
            $settings = SiteSetting::create($data);
        } else {
            $settings->update($data);
        }

        Notification::make()
            ->success()
            ->title('Настройки сохранены')
            ->body('Общие настройки сайта успешно обновлены.')
            ->send();
    }
}

<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- SEO: Title и Description из настроек --}}
    <title>{{ $settings->home_title ?? config('app.name', 'Laravel') }}</title>
    @if($settings && $settings->home_description)
        <meta name="description" content="{{ $settings->home_description }}">
    @endif

    {{-- Favicon из настроек --}}
    @if($settings && $settings->favicon_path)
        <link rel="icon" type="image/x-icon" href="{{ url(Storage::disk('public')->url($settings->favicon_path)) }}">
    @endif

    {{-- Google Fonts - Montserrat --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

    {{-- Яндекс Метрика из настроек --}}
    @if($settings && $settings->yandex_metrika_code)
        {!! $settings->yandex_metrika_code !!}
    @endif

    {{-- Прочие скрипты в head из настроек --}}
    @if($settings && $settings->custom_head_scripts)
        {!! $settings->custom_head_scripts !!}
    @endif

    {{-- ВАЖНО: преамбула для React Fast Refresh --}}
    @viteReactRefresh

    {{-- Подключаем наш entry --}}
    @vite('resources/react/main.tsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>


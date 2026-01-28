@extends('emails.layouts.base')

@section('title', 'Добро пожаловать!')

@section('header', '🌸 Добро пожаловать!')

@section('content')
    <p>Здравствуйте, <strong>{{ $user->name }}</strong>!</p>

    <p>Благодарим вас за регистрацию в нашем магазине цветов. Теперь вы можете:</p>

    <ul>
        <li>Оформлять заказы быстрее</li>
        <li>Отслеживать статус ваших заказов</li>
        <li>Просматривать историю покупок</li>
        <li>Сохранять адреса доставки</li>
    </ul>

    <div class="credentials">
        <div class="credentials-row">
            <span class="credentials-label">Email:</span>
            <span class="credentials-value">{{ $user->email }}</span>
        </div>
        @if($user->phone)
        <div class="credentials-row">
            <span class="credentials-label">Телефон:</span>
            <span class="credentials-value">{{ $user->phone }}</span>
        </div>
        @endif
    </div>

    <p>Вы можете войти в личный кабинет, используя email или телефон и пароль, указанные при регистрации.</p>

    <div class="button-container">
        <a href="{{ config('app.url') }}" class="button">Перейти на сайт</a>
    </div>

    <div class="info-box">
        💐 Мы рады видеть вас среди наших клиентов!
    </div>
@endsection


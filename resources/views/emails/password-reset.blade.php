@extends('emails.layouts.base')

@section('title', 'Восстановление пароля')

@section('header', '🔐 Восстановление пароля')

@section('content')
    <p>Здравствуйте, <strong>{{ $user->name }}</strong>!</p>

    <p>Вы запросили восстановление пароля для вашего аккаунта. Ваш новый пароль:</p>

    <div class="credentials">
        <div class="credentials-row">
            <span class="credentials-label">Email:</span>
            <span class="credentials-value">{{ $user->email }}</span>
        </div>
        <div class="credentials-row">
            <span class="credentials-label">Новый пароль:</span>
            <span class="credentials-value">{{ $newPassword }}</span>
        </div>
    </div>

    <div class="button-container">
        <a href="{{ config('app.url') }}" class="button">Войти на сайт</a>
    </div>

    <div class="info-box">
        ℹ️ Если вы не запрашивали восстановление пароля, пожалуйста, проигнорируйте это письмо или свяжитесь с нами.
    </div>
@endsection


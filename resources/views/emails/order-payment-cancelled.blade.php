@extends('emails.layouts.base')

@section('title', 'Платёж отменён')

@section('header', '❌ Платёж отменён')

@section('content')
    <p>Здравствуйте, <strong>{{ $order->user->name }}</strong>!</p>

    <p>К сожалению, платёж по вашему заказу <strong>№{{ $order->order_number }}</strong> был отменён.</p>

    <div class="error-box">
        ⚠️ Заказ не будет обработан до получения оплаты.
    </div>

    <div class="credentials">
        <div class="credentials-row">
            <span class="credentials-label">Номер заказа:</span>
            <span class="credentials-value">{{ $order->order_number }}</span>
        </div>
        <div class="credentials-row">
            <span class="credentials-label">Сумма заказа:</span>
            <span class="credentials-value">{{ number_format($order->total, 0, ',', ' ') }} ₽</span>
        </div>
        <div class="credentials-row">
            <span class="credentials-label">Дата доставки:</span>
            <span class="credentials-value">{{ $order->delivery_date->format('d.m.Y') }}</span>
        </div>
    </div>

    <h3 style="margin-top: 30px; margin-bottom: 15px;">Что делать дальше?</h3>

    <p>Вы можете:</p>
    <ul>
        <li>Оформить новый заказ на нашем сайте</li>
        <li>Связаться с нами для уточнения деталей</li>
    </ul>

    <div class="button-container">
        <a href="{{ config('app.url') }}" class="button">Перейти на сайт</a>
    </div>

    <div class="info-box">
        ℹ️ Если у вас возникли вопросы или проблемы с оплатой, пожалуйста, свяжитесь с нами.
    </div>
@endsection


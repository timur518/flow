@extends('emails.layouts.base')

@section('title', 'Заказ №' . $order->order_number)

@section('header', '🌸 Заказ оформлен!')

@section('content')
    <p>Здравствуйте, <strong>{{ $order->user->name }}</strong>!</p>

    <p>Благодарим вас за заказ! Ваш заказ <strong>№{{ $order->order_number }}</strong> успешно оформлен.</p>

    <div class="credentials">
        <div class="credentials-row">
            <span class="credentials-label">Номер заказа:</span>
            <span class="credentials-value">{{ $order->order_number }}</span>
        </div>
        <div class="credentials-row">
            <span class="credentials-label">Дата доставки:</span>
            <span class="credentials-value">{{ $order->delivery_date->format('d.m.Y') }}</span>
        </div>
        <div class="credentials-row">
            <span class="credentials-label">Время доставки:</span>
            <span class="credentials-value">{{ $order->delivery_time }}</span>
        </div>
        @if($order->delivery_type === 'delivery')
        <div class="credentials-row">
            <span class="credentials-label">Адрес доставки:</span>
            <span class="credentials-value">{{ $order->delivery_address }}</span>
        </div>
        @else
        <div class="credentials-row">
            <span class="credentials-label">Способ получения:</span>
            <span class="credentials-value">Самовывоз</span>
        </div>
        @endif
        <div class="credentials-row">
            <span class="credentials-label">Способ оплаты:</span>
            <span class="credentials-value">{{ $order->payment_type === 'online' ? 'Онлайн оплата' : 'При получении' }}</span>
        </div>
    </div>

    <h3 style="margin-top: 30px; margin-bottom: 15px;">Состав заказа:</h3>

    <table>
        <thead>
            <tr>
                <th>Товар</th>
                <th style="text-align: center;">Кол-во</th>
                <th style="text-align: right;">Сумма</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td style="text-align: center;">{{ $item->quantity }}</td>
                <td style="text-align: right;">{{ number_format($item->total, 0, ',', ' ') }} ₽</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="credentials" style="margin-top: 20px;">
        <div class="credentials-row">
            <span class="credentials-label">Подытог:</span>
            <span class="credentials-value">{{ number_format($order->subtotal, 0, ',', ' ') }} ₽</span>
        </div>
        @if($order->discount > 0)
        <div class="credentials-row">
            <span class="credentials-label">Скидка:</span>
            <span class="credentials-value" style="color: #28a745;">-{{ number_format($order->discount, 0, ',', ' ') }} ₽</span>
        </div>
        @endif
        @if($order->delivery_cost > 0)
        <div class="credentials-row">
            <span class="credentials-label">Доставка:</span>
            <span class="credentials-value">{{ number_format($order->delivery_cost, 0, ',', ' ') }} ₽</span>
        </div>
        @endif
        <div class="credentials-row" style="font-size: 18px;">
            <span class="credentials-label"><strong>Итого:</strong></span>
            <span class="credentials-value"><strong>{{ number_format($order->total, 0, ',', ' ') }} ₽</strong></span>
        </div>
    </div>

    <div class="button-container">
        <a href="{{ config('app.url') }}" class="button">Перейти на сайт</a>
    </div>

    <div class="info-box">
        💐 Спасибо, что выбрали нас! Мы свяжемся с вами для подтверждения заказа.
    </div>
@endsection


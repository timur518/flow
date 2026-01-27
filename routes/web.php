<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

// Старая welcome страница (если понадобится)
Route::get('/welcome', function () {
    return view('welcome');
});

// Обработка возврата из YooKassa после оплаты
Route::get('/payment/return', [PaymentController::class, 'return']);

// React SPA - все маршруты возвращают одно и то же представление
// Роутинг обрабатывается на стороне React Router
Route::get('/{any}', function () {
    // Получаем настройки сайта для передачи в Blade
    $settings = \App\Models\SiteSetting::first();

    return view('app', [
        'settings' => $settings,
    ]);
})->where('any', '.*');

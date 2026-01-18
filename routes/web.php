<?php

use Illuminate\Support\Facades\Route;

// Старая welcome страница (если понадобится)
Route::get('/welcome', function () {
    return view('welcome');
});

// React SPA - все маршруты возвращают одно и то же представление
// Роутинг обрабатывается на стороне React Router
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

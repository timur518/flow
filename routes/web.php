<?php

use Illuminate\Support\Facades\Route;

// React приложение на главной странице
Route::get('/', function () {
    return view('app');
});

// Старая welcome страница (если понадобится)
Route::get('/welcome', function () {
    return view('welcome');
});

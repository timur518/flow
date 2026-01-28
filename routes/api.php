<?php

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\PromoCodeController;
use App\Http\Controllers\Api\V1\SiteSettingController;
use App\Http\Controllers\Api\V1\StoreController;
use App\Http\Controllers\Api\V1\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Публичные маршруты
    Route::get('/settings', [SiteSettingController::class, 'index']);
    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/cities', [CityController::class, 'index']);
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{id}', [StoreController::class, 'show']);
    Route::get('/stores/{id}/delivery-periods', [StoreController::class, 'deliveryPeriods']);
    Route::get('/stores/{id}/delivery-zones', [StoreController::class, 'deliveryZones']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Промокоды
    Route::post('/promo-codes/validate', [PromoCodeController::class, 'validate']);

    // Расчет стоимости доставки
    Route::post('/delivery/calculate', [DeliveryController::class, 'calculate']);

    // Аутентификация
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

        // Защищенные маршруты аутентификации
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/profile', [AuthController::class, 'profile']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
        });
    });

    // Защищенные маршруты для адресов
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('addresses', AddressController::class);
        Route::post('/addresses/{address}/set-default', [AddressController::class, 'setDefault']);
    });

    // Создание заказа (доступно и гостям, и авторизованным пользователям)
    Route::post('/orders', [OrderController::class, 'store']);

    // Защищенные маршруты для заказов (только для авторизованных)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
    });

    // Webhook для YooKassa (без аутентификации)
    Route::post('/yookassa/webhook', [OrderController::class, 'yookassaWebhook']);
});


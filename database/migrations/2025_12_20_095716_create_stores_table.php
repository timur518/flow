<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();

            // Основная информация
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('address');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('whatsapp_url')->nullable();
            $table->string('telegram_chat_url')->nullable();
            $table->string('telegram_channel_url')->nullable();
            $table->string('max_chat_url')->nullable();
            $table->string('max_group_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('vk_url')->nullable();
            $table->string('telegram_chat_id')->nullable();

            // Координаты магазина
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('yandex_maps_url')->nullable();
            $table->text('yandex_maps_code')->nullable();

            // Настройки доставки
            $table->decimal('min_free_delivery_amount', 10, 2)->nullable();

            // Юр лицо
            $table->string('legal_name')->nullable();
            $table->string('inn', 12)->nullable();
            $table->string('ogrn', 15)->nullable();
            $table->string('legal_address')->nullable();

            // Настройки платежей
            $table->boolean('orders_blocked')->default(false);
            $table->boolean('payment_on_delivery')->default(true);
            $table->boolean('payment_online')->default(true);
            $table->string('yookassa_shop_id')->nullable();
            $table->string('yookassa_secret_key')->nullable();

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};

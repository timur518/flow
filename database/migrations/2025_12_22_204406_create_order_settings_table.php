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
        Schema::create('order_settings', function (Blueprint $table) {
            $table->id();

            // Массовое изменение цен
            $table->boolean('bulk_price_change_enabled')->default(false);
            $table->decimal('price_change_percentage', 8, 2)->default(0); // может быть отрицательным
            $table->json('selected_category_ids')->nullable(); // массив ID категорий

            // Telegram уведомления
            $table->string('telegram_bot_token')->nullable();
            $table->string('telegram_chat_ids')->nullable(); // через запятую
            $table->boolean('telegram_notifications_enabled')->default(false);

            // Email уведомления
            $table->boolean('email_new_order_to_customer')->default(true);
            $table->boolean('email_delivery_complete_to_customer')->default(true);
            $table->boolean('email_new_order_to_admin')->default(true);
            $table->string('admin_email')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_settings');
    }
};

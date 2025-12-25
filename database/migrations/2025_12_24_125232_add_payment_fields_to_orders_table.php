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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_status')->default('pending')->after('payment_type'); // pending, succeeded, cancelled
            $table->string('payment_id')->nullable()->after('payment_status'); // YooKassa payment ID
            $table->text('payment_url')->nullable()->after('payment_id'); // URL для оплаты
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_id', 'payment_url']);
        });
    }
};

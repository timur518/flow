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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // General info
            $table->string('order_number')->unique();
            $table->string('status')->default('new'); // new, processing, assembling, awaiting_delivery, delivering, completed, cancelled
            $table->string('payment_type')->default('on_delivery'); // on_delivery, online
            $table->string('promo_code')->nullable();
            $table->string('courier')->nullable();

            // Customer info
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_phone')->nullable();
            $table->boolean('is_anonymous')->default(false);

            // Recipient info
            $table->string('recipient_name')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->string('recipient_social')->nullable();

            // Delivery info
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('delivery_type')->default('delivery'); // delivery, pickup
            $table->string('delivery_address')->nullable();
            $table->date('delivery_date')->nullable();
            $table->foreignId('delivery_period_id')->nullable()->constrained()->nullOnDelete();

            // Totals
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

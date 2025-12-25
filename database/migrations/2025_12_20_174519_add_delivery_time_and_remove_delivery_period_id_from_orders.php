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
            $table->string('delivery_time')->nullable()->after('delivery_date');
            $table->dropForeign(['delivery_period_id']);
            $table->dropColumn('delivery_period_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('delivery_period_id')->nullable()->after('delivery_date')->constrained()->nullOnDelete();
            $table->dropColumn('delivery_time');
        });
    }
};

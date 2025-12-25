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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('address'); // Полный адрес
            $table->string('apartment')->nullable(); // Квартира/офис
            $table->string('entrance')->nullable(); // Подъезд
            $table->string('floor')->nullable(); // Этаж
            $table->string('intercom')->nullable(); // Код домофона
            $table->text('comment')->nullable(); // Комментарий к адресу
            $table->decimal('latitude', 10, 8); // Широта
            $table->decimal('longitude', 11, 8); // Долгота
            $table->boolean('is_default')->default(false); // Адрес по умолчанию
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};

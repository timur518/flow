<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\DeliveryService;

$service = app(DeliveryService::class);

echo "=== ТЕСТ ЗОН ДОСТАВКИ ВОРОНЕЖА ===\n\n";

// Тестовые точки в Воронеже
$testPoints = [
    ['name' => 'Центр Воронежа', 'lat' => 51.6605, 'lng' => 39.2005],
    ['name' => 'Северный район', 'lat' => 51.7100, 'lng' => 39.2200],
    ['name' => 'Южный район', 'lat' => 51.6300, 'lng' => 39.2500],
    ['name' => 'Вне зон', 'lat' => 51.5000, 'lng' => 39.1000],
];

foreach ($testPoints as $point) {
    echo "📍 Точка: {$point['name']}\n";
    echo "   Координаты: lat={$point['lat']}, lng={$point['lng']}\n";
    
    $result = $service->calculateDeliveryCost(
        latitude: $point['lat'],
        longitude: $point['lng'],
        storeId: 2,
        subtotal: 5000
    );
    
    if ($result['success']) {
        echo "   ✅ Зона найдена: {$result['zone_name']}\n";
        echo "   💰 Стоимость доставки: {$result['delivery_cost']} руб\n";
        echo "   🎁 Бесплатная доставка от: {$result['min_free_delivery_amount']} руб\n";
        if ($result['message']) {
            echo "   📝 {$result['message']}\n";
        }
    } else {
        echo "   ❌ {$result['message']}\n";
    }
    echo "\n";
}

echo "=== ИНФОРМАЦИЯ О ЗОНАХ ===\n\n";
$zones = \App\Models\DeliveryZone::where('store_id', 2)->get();
foreach ($zones as $zone) {
    echo "Зона: {$zone->name} (ID: {$zone->id})\n";
    echo "Стоимость: {$zone->delivery_cost} руб\n";
    echo "Бесплатная доставка от: {$zone->min_free_delivery_amount} руб\n";
    
    $coords = json_decode($zone->getRawOriginal('polygon_coordinates'), true);
    if (is_array($coords) && count($coords) > 0) {
        echo "Координаты: " . count($coords) . " точек\n";
        echo "Первая точка: [{$coords[0][0]}, {$coords[0][1]}]\n";
        
        // Проверяем формат
        if ($coords[0][0] > 50 && $coords[0][0] < 52) {
            echo "✅ Формат правильный: [latitude, longitude]\n";
        } else {
            echo "❌ ОШИБКА: Формат неправильный! Нужно поменять местами координаты\n";
            echo "   Должно быть: [latitude (51.x), longitude (39.x)]\n";
        }
    } else {
        echo "❌ Координаты не установлены\n";
    }
    echo "\n";
}


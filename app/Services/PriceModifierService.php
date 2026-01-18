<?php

namespace App\Services;

use App\Models\OrderSetting;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class PriceModifierService
{
    /**
     * Получить настройки заказов с кешированием
     */
    protected function getOrderSettings(): ?OrderSetting
    {
        return Cache::remember('order_settings', 60, function () {
            return OrderSetting::first();
        });
    }

    /**
     * Проверить, нужно ли применять изменение цены для товара
     */
    protected function shouldApplyPriceChange(Product $product, OrderSetting $settings): bool
    {
        // Если массовое изменение цен отключено
        if (!$settings->bulk_price_change_enabled) {
            return false;
        }

        // Если процент изменения равен 0
        if ($settings->price_change_percentage == 0) {
            return false;
        }

        // Если не выбраны категории - применяем ко всем товарам
        if (empty($settings->selected_category_ids)) {
            return true;
        }

        // Проверяем, есть ли у товара категории из выбранных
        $productCategoryIds = $product->categories->pluck('id')->toArray();
        $selectedCategoryIds = $settings->selected_category_ids;

        return !empty(array_intersect($productCategoryIds, $selectedCategoryIds));
    }

    /**
     * Рассчитать измененную цену
     */
    protected function calculateModifiedPrice(float $originalPrice, float $percentage): float
    {
        $modifier = 1 + ($percentage / 100);
        $modifiedPrice = $originalPrice * $modifier;

        // Округляем до 2 знаков после запятой
        return round($modifiedPrice, 2);
    }

    /**
     * Получить цены товара с учетом настроек массового изменения
     *
     * Логика:
     * - Модифицируем базовую цену (price)
     * - Если у товара есть sale_price - модифицируем и его
     * - Обе цены изменяются на один и тот же процент
     */
    public function getModifiedPrices(Product $product): array
    {
        $settings = $this->getOrderSettings();

        // Если настроек нет или изменение цен отключено
        if (!$settings || !$this->shouldApplyPriceChange($product, $settings)) {
            return [
                'price' => $product->price,
                'sale_price' => $product->sale_price,
            ];
        }

        // Модифицируем базовую цену
        $modifiedPrice = $this->calculateModifiedPrice(
            (float) $product->price,
            (float) $settings->price_change_percentage
        );

        // Модифицируем скидочную цену, если она есть
        $modifiedSalePrice = $product->sale_price
            ? $this->calculateModifiedPrice(
                (float) $product->sale_price,
                (float) $settings->price_change_percentage
            )
            : null;

        return [
            'price' => $modifiedPrice,
            'sale_price' => $modifiedSalePrice,
        ];
    }

    /**
     * Получить информацию о настройках изменения цен
     */
    public function getPriceChangeInfo(): ?array
    {
        $settings = $this->getOrderSettings();

        if (!$settings || !$settings->bulk_price_change_enabled) {
            return null;
        }

        return [
            'enabled' => true,
            'percentage' => $settings->price_change_percentage,
            'category_ids' => $settings->selected_category_ids,
            'applies_to_all' => empty($settings->selected_category_ids),
        ];
    }
}


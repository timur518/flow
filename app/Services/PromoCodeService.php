<?php

namespace App\Services;

use App\Models\PromoCode;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PromoCodeService
{
    /**
     * Валидация промокода
     *
     * @param string $code
     * @return array{valid: bool, message: string|null, promo_code: PromoCode|null}
     */
    public function validate(string $code): array
    {
        // Найти промокод
        $promoCode = PromoCode::where('code', $code)->first();

        if (!$promoCode) {
            return [
                'valid' => false,
                'message' => 'Промокод не найден',
                'promo_code' => null,
            ];
        }

        // Проверка активности
        if (!$promoCode->is_active) {
            return [
                'valid' => false,
                'message' => 'Промокод неактивен',
                'promo_code' => null,
            ];
        }

        // Проверка срока действия (от)
        if ($promoCode->valid_from && Carbon::parse($promoCode->valid_from)->isFuture()) {
            return [
                'valid' => false,
                'message' => 'Промокод еще не действует',
                'promo_code' => null,
            ];
        }

        // Проверка срока действия (до)
        if ($promoCode->valid_until && Carbon::parse($promoCode->valid_until)->isPast()) {
            return [
                'valid' => false,
                'message' => 'Срок действия промокода истек',
                'promo_code' => null,
            ];
        }

        // Проверка лимита использований
        if ($promoCode->usage_limit && $promoCode->usage_count >= $promoCode->usage_limit) {
            return [
                'valid' => false,
                'message' => 'Промокод исчерпан',
                'promo_code' => null,
            ];
        }

        // Проверка что указана хотя бы одна скидка
        if (!$promoCode->discount_amount && !$promoCode->discount_percent) {
            return [
                'valid' => false,
                'message' => 'Промокод настроен некорректно',
                'promo_code' => null,
            ];
        }

        return [
            'valid' => true,
            'message' => null,
            'promo_code' => $promoCode,
        ];
    }

    /**
     * Рассчитать скидку по промокоду
     *
     * @param PromoCode $promoCode
     * @param float $subtotal
     * @return array{discount: float, total: float}
     */
    public function calculateDiscount(PromoCode $promoCode, float $subtotal): array
    {
        $discount = 0;

        // Приоритет: сначала фиксированная скидка, потом процентная
        if ($promoCode->discount_amount) {
            // Фиксированная скидка в рублях
            $discount = (float) $promoCode->discount_amount;
        } elseif ($promoCode->discount_percent) {
            // Процентная скидка
            $discount = $subtotal * ($promoCode->discount_percent / 100);
        }

        // Округление до 2 знаков
        $discount = round($discount, 2);

        // ВАЖНО: Минимальная сумма заказа должна быть 1 рубль
        // Скидка не может превышать (subtotal - 1)
        $maxDiscount = $subtotal - 1;
        if ($discount > $maxDiscount) {
            $discount = max(0, $maxDiscount);
        }

        $total = $subtotal - $discount;

        // Гарантируем минимум 1 рубль
        if ($total < 1) {
            $total = 1;
            $discount = $subtotal - 1;
        }

        return [
            'discount' => round($discount, 2),
            'total' => round($total, 2),
        ];
    }

    /**
     * Применить промокод (увеличить счетчик использований)
     *
     * @param PromoCode $promoCode
     * @return void
     */
    public function apply(PromoCode $promoCode): void
    {
        $promoCode->increment('usage_count');
    }

    /**
     * Валидация и расчет скидки в одном методе
     *
     * @param string $code
     * @param float $subtotal
     * @return array{valid: bool, message: string|null, promo_code: PromoCode|null, discount: float, total: float}
     */
    public function validateAndCalculate(string $code, float $subtotal): array
    {
        $validation = $this->validate($code);

        if (!$validation['valid']) {
            return [
                'valid' => false,
                'message' => $validation['message'],
                'promo_code' => null,
                'discount' => 0,
                'total' => $subtotal,
            ];
        }

        $calculation = $this->calculateDiscount($validation['promo_code'], $subtotal);

        return [
            'valid' => true,
            'message' => null,
            'promo_code' => $validation['promo_code'],
            'discount' => $calculation['discount'],
            'total' => $calculation['total'],
        ];
    }
}


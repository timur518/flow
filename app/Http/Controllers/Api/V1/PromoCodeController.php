<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PromoCode\ValidatePromoCodeRequest;
use App\Models\Product;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;

class PromoCodeController extends Controller
{
    public function __construct(
        private PromoCodeService $promoCodeService
    ) {}

    /**
     * Валидация промокода и расчет скидки
     *
     * POST /api/v1/promo-codes/validate
     *
     * @param ValidatePromoCodeRequest $request
     * @return JsonResponse
     */
    public function validate(ValidatePromoCodeRequest $request): JsonResponse
    {
        $code = $request->input('code');
        $items = $request->input('items');

        // Рассчитать subtotal на основе товаров
        $subtotal = 0;
        $productIds = collect($items)->pluck('product_id')->toArray();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (!$product) {
                continue;
            }

            // Используем sale_price если есть, иначе обычную price
            $price = $product->sale_price ?? $product->price;
            $subtotal += $price * $item['quantity'];
        }

        // Валидация и расчет скидки
        $result = $this->promoCodeService->validateAndCalculate($code, $subtotal);

        if (!$result['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'promo_code' => [
                'code' => $result['promo_code']->code,
                'discount_type' => $result['promo_code']->discount_amount ? 'fixed' : 'percentage',
                'discount_value' => $result['promo_code']->discount_amount 
                    ? (float) $result['promo_code']->discount_amount 
                    : $result['promo_code']->discount_percent,
            ],
            'calculation' => [
                'subtotal' => round($subtotal, 2),
                'discount' => $result['discount'],
                'total' => $result['total'],
            ],
        ]);
    }
}


<?php

namespace App\Http\Requests\PromoCode;

use Illuminate\Foundation\Http\FormRequest;

class ValidatePromoCodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Введите промокод',
            'code.string' => 'Промокод должен быть строкой',
            'code.max' => 'Промокод не должен превышать 50 символов',
            'items.required' => 'Добавьте товары в корзину',
            'items.array' => 'Неверный формат товаров',
            'items.min' => 'Добавьте хотя бы один товар',
            'items.*.product_id.required' => 'Укажите ID товара',
            'items.*.product_id.integer' => 'ID товара должен быть числом',
            'items.*.product_id.exists' => 'Товар не найден',
            'items.*.quantity.required' => 'Укажите количество',
            'items.*.quantity.integer' => 'Количество должно быть числом',
            'items.*.quantity.min' => 'Минимальное количество: 1',
        ];
    }
}


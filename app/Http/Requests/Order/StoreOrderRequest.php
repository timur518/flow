<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Проверяем, авторизован ли пользователь
     */
    protected function isGuest(): bool
    {
        return !$this->user();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            // Тип оплаты
            'payment_type' => ['required', 'string', 'in:on_delivery,online'],

            // Промокод (опционально)
            'promo_code' => ['nullable', 'string', 'max:50'],

            // Анонимный заказ
            'is_anonymous' => ['nullable', 'boolean'],

            // Получатель заказа
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'recipient_phone' => ['nullable', 'string', 'max:20'],
            'recipient_social' => ['nullable', 'string', 'max:500'],

            // Информация о доставке
            'city_id' => ['required', 'exists:cities,id'],
            'delivery_type' => ['required', 'string', 'in:delivery,pickup'],
            'delivery_address' => ['required_if:delivery_type,delivery', 'nullable', 'string', 'max:500'],
            // Координаты обязательны только для доставки и если адрес НЕ "Уточнить у получателя"
            'delivery_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_date' => ['required', 'date', 'after_or_equal:today'],
            'delivery_time' => ['required', 'string', 'max:50'],

            // Товары в заказе
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];

        // Для гостей добавляем обязательные поля заказчика
        if ($this->isGuest()) {
            $rules['customer_name'] = [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[а-яА-ЯёЁa-zA-Z\s\-]+$/u'
            ];
            $rules['customer_phone'] = [
                'required',
                'string',
                'regex:/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/'
            ];
            $rules['customer_email'] = [
                'required',
                'string',
                'email:rfc,dns',
                'max:255'
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payment_type.required' => 'Тип оплаты обязателен',
            'payment_type.in' => 'Некорректный тип оплаты',
            'city_id.required' => 'Город обязателен',
            'city_id.exists' => 'Выбранный город не найден',
            'delivery_type.required' => 'Тип доставки обязателен',
            'delivery_type.in' => 'Некорректный тип доставки',
            'delivery_address.required_if' => 'Адрес доставки обязателен',
            'delivery_latitude.required_if' => 'Координаты адреса обязательны',
            'delivery_latitude.between' => 'Некорректная широта адреса',
            'delivery_longitude.required_if' => 'Координаты адреса обязательны',
            'delivery_longitude.between' => 'Некорректная долгота адреса',
            'delivery_date.required' => 'Дата доставки обязательна',
            'delivery_date.after_or_equal' => 'Дата доставки не может быть в прошлом',
            'delivery_time.required' => 'Время доставки обязательно',
            'items.required' => 'Добавьте хотя бы один товар',
            'items.min' => 'Добавьте хотя бы один товар',
            'items.*.product_id.required' => 'ID товара обязателен',
            'items.*.product_id.exists' => 'Товар не найден',
            'items.*.quantity.required' => 'Количество обязательно',
            'items.*.quantity.min' => 'Количество должно быть не менее 1',
            // Сообщения для гостевых полей
            'customer_name.required' => 'Имя заказчика обязательно',
            'customer_name.min' => 'Имя должно содержать минимум 2 символа',
            'customer_name.max' => 'Имя не должно превышать 100 символов',
            'customer_name.regex' => 'Имя может содержать только буквы, пробелы и дефисы',
            'customer_phone.required' => 'Телефон заказчика обязателен',
            'customer_phone.regex' => 'Телефон должен быть в формате +7(XXX)XXX-XX-XX',
            'customer_email.required' => 'Email заказчика обязателен',
            'customer_email.email' => 'Некорректный формат email',
            'customer_email.max' => 'Email не должен превышать 255 символов',
        ];
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Подготовка данных перед валидацией
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            // Очищаем логин от пробелов и приводим к нижнему регистру
            'login' => strtolower(trim($this->login ?? '')),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Логин: email или телефон
            'login' => [
                'required',
                'string',
                'max:255'
            ],

            // Пароль
            'password' => [
                'required',
                'string',
                'max:255'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'login.required' => 'Email или телефон обязателен для заполнения',
            'login.max' => 'Email или телефон не должен превышать 255 символов',

            'password.required' => 'Пароль обязателен для заполнения',
            'password.max' => 'Пароль не должен превышать 255 символов',
        ];
    }
}

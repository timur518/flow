<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            // Очищаем имя от лишних пробелов
            'name' => trim($this->name ?? ''),
            // Приводим email к нижнему регистру и очищаем
            'email' => strtolower(trim($this->email ?? '')),
            // Очищаем телефон от пробелов
            'phone' => trim($this->phone ?? ''),
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
            // Имя: только буквы (кириллица, латиница), пробелы, дефисы
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[а-яА-ЯёЁa-zA-Z\s\-]+$/u'
            ],

            // Email: стандартная валидация + проверка на уникальность
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                'unique:users,email'
            ],

            // Телефон: формат +7(XXX)XXX-XX-XX
            'phone' => [
                'required',
                'string',
                'regex:/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/',
                'unique:users,phone'
            ],

            // Пароль: минимум 6 символов, без опасных символов
            'password' => [
                'required',
                'string',
                'min:6',
                'max:255',
                'regex:/^[a-zA-Zа-яА-ЯёЁ0-9!@#$%^&*()_+\-=\[\]{};:,.<>?\/\\|`~]+$/',
                'confirmed'
            ],

            // Город: опциональный, должен существовать в таблице cities
            'city_id' => [
                'nullable',
                'integer',
                'exists:cities,id'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно для заполнения',
            'name.min' => 'Имя должно содержать минимум 2 символа',
            'name.max' => 'Имя не должно превышать 100 символов',
            'name.regex' => 'Имя может содержать только буквы, пробелы и дефисы',

            'email.required' => 'Email обязателен для заполнения',
            'email.email' => 'Введите корректный email адрес',
            'email.unique' => 'Пользователь с таким email уже зарегистрирован',

            'phone.required' => 'Телефон обязателен для заполнения',
            'phone.regex' => 'Телефон должен быть в формате +7(XXX)XXX-XX-XX',
            'phone.unique' => 'Пользователь с таким телефоном уже зарегистрирован',

            'password.required' => 'Пароль обязателен для заполнения',
            'password.min' => 'Пароль должен содержать минимум 6 символов',
            'password.max' => 'Пароль не должен превышать 255 символов',
            'password.regex' => 'Пароль содержит недопустимые символы',
            'password.confirmed' => 'Пароли не совпадают',
        ];
    }
}

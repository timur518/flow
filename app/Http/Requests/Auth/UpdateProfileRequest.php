<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
        $data = [];

        if ($this->has('name')) {
            $data['name'] = trim($this->name);
        }

        if ($this->has('email')) {
            $data['email'] = strtolower(trim($this->email));
        }

        if ($this->has('phone')) {
            $data['phone'] = trim($this->phone);
        }

        $this->merge($data);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = auth()->id();

        return [
            // Имя: только буквы (кириллица, латиница), пробелы, дефисы
            'name' => [
                'sometimes',
                'string',
                'min:2',
                'max:100',
                'regex:/^[а-яА-ЯёЁa-zA-Z\s\-]+$/u'
            ],

            // Email: стандартная валидация + проверка на уникальность (исключая текущего пользователя)
            'email' => [
                'sometimes',
                'string',
                'email:rfc,dns',
                'max:255',
                'unique:users,email,' . $userId
            ],

            // Телефон: формат +7(XXX)XXX-XX-XX
            'phone' => [
                'sometimes',
                'string',
                'regex:/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/',
                'unique:users,phone,' . $userId
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.min' => 'Имя должно содержать минимум 2 символа',
            'name.max' => 'Имя не должно превышать 100 символов',
            'name.regex' => 'Имя может содержать только буквы, пробелы и дефисы',

            'email.email' => 'Введите корректный email адрес',
            'email.unique' => 'Пользователь с таким email уже зарегистрирован',

            'phone.regex' => 'Телефон должен быть в формате +7(XXX)XXX-XX-XX',
            'phone.unique' => 'Пользователь с таким телефоном уже зарегистрирован',
        ];
    }
}

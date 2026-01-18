<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
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
            'current_password' => [
                'required',
                'string',
                'max:255'
            ],

            // Новый пароль: минимум 6 символов, без опасных символов
            'password' => [
                'required',
                'string',
                'min:6',
                'max:255',
                'regex:/^[a-zA-Zа-яА-ЯёЁ0-9!@#$%^&*()_+\-=\[\]{};:,.<>?\/\\|`~]+$/',
                'confirmed'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Текущий пароль обязателен для заполнения',

            'password.required' => 'Новый пароль обязателен для заполнения',
            'password.min' => 'Пароль должен содержать минимум 6 символов',
            'password.max' => 'Пароль не должен превышать 255 символов',
            'password.regex' => 'Пароль содержит недопустимые символы',
            'password.confirmed' => 'Пароли не совпадают',
        ];
    }
}

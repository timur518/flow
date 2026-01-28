<?php

namespace App\Services;

use App\Mail\GuestRegistrationMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class GuestRegistrationService
{
    /**
     * Зарегистрировать нового пользователя или найти существующего по email/телефону
     *
     * @param string $name Имя пользователя
     * @param string $phone Телефон
     * @param string $email Email
     * @return array{user: User, token: string, is_new: bool}
     */
    public function registerOrFind(string $name, string $phone, string $email): array
    {
        // Ищем существующего пользователя по email или телефону
        $existingUser = User::where('email', $email)
            ->orWhere('phone', $phone)
            ->first();

        if ($existingUser) {
            // Пользователь уже существует — создаём токен и возвращаем
            $token = $existingUser->createToken('guest_order_token')->plainTextToken;

            return [
                'user' => $existingUser,
                'token' => $token,
                'is_new' => false,
            ];
        }

        // Создаём нового пользователя
        $password = $this->generatePassword();

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => Hash::make($password),
        ]);

        // Назначаем роль customer
        $user->assignRole('customer');

        // Создаём токен авторизации
        $token = $user->createToken('guest_order_token')->plainTextToken;

        // Отправляем email с данными для входа
        $this->sendRegistrationEmail($user, $password);

        // Отправляем Telegram уведомление о новой регистрации
        $this->sendTelegramNotification($user);

        Log::info('Guest user registered during order', [
            'user_id' => $user->id,
            'email' => $email,
            'phone' => $phone,
        ]);

        return [
            'user' => $user,
            'token' => $token,
            'is_new' => true,
        ];
    }

    /**
     * Генерация случайного пароля
     */
    private function generatePassword(): string
    {
        // Генерируем пароль из 8 символов: буквы и цифры
        return Str::random(8);
    }

    /**
     * Отправка email с данными для входа
     */
    private function sendRegistrationEmail(User $user, string $password): void
    {
        try {
            Mail::to($user->email)->send(new GuestRegistrationMail($user, $password));

            Log::info('Guest registration email sent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send guest registration email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Отправка Telegram уведомления о новой регистрации
     */
    private function sendTelegramNotification(User $user): void
    {
        try {
            $telegramService = app(TelegramService::class);
            $telegramService->sendNewUserRegistrationNotification($user);
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram notification for guest registration', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}


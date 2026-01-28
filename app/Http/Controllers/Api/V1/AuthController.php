<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Mail\PasswordResetMail;
use App\Mail\WelcomeMail;
use App\Models\User;
use App\Services\EmailService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        private EmailService $emailService
    ) {}

    /**
     * Регистрация нового пользователя
     */
    public function register(RegisterRequest $request, TelegramService $telegramService): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // Назначаем роль customer по умолчанию
        $user->assignRole('customer');

        // Отправляем уведомление в Telegram о новой регистрации
        $telegramService->sendNewUserRegistrationNotification($user);

        // Отправляем Email-письмо о регистрации
        $this->emailService->send($user->email, new WelcomeMail($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Регистрация прошла успешно',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Вход пользователя (по email или телефону)
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        if (!Auth::attempt([$loginField => $request->login, 'password' => $request->password])) {
            return response()->json([
                'message' => 'Неверные учетные данные',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Вход выполнен успешно',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Выход пользователя
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Выход выполнен успешно',
        ]);
    }

    /**
     * Получить профиль текущего пользователя
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('city');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Обновить профиль текущего пользователя
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Профиль обновлен успешно',
            'user' => new UserResource($user->fresh('city')),
        ]);
    }

    /**
     * Изменить пароль
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Текущий пароль неверен',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Пароль изменен успешно',
        ]);
    }

    /**
     * Запросить восстановление пароля
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Пользователь с таким email не найден',
            ], 404);
        }

        // Генерируем новый пароль
        $newPassword = Str::random(8);

        // Обновляем пароль пользователя
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Отправляем письмо с новым паролем
        $this->emailService->send($user->email, new PasswordResetMail($user, $newPassword));

        return response()->json([
            'message' => 'Новый пароль отправлен на указанный email',
        ]);
    }
}

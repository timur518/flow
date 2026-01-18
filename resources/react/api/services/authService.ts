/**
 * Auth Service
 * Сервис для работы с аутентификацией
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { TokenManager } from '../utils/tokenManager';
import {
    AuthResponse,
    RegisterData,
    LoginData,
    User,
    UpdateProfileData,
    ChangePasswordData,
} from '../types';

export const authService = {
    /**
     * Регистрация нового пользователя
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );

        // Сохраняем токен
        if (response.data.token) {
            TokenManager.setToken(response.data.token);
        }

        return response.data;
    },

    /**
     * Вход пользователя
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        );

        // Сохраняем токен
        if (response.data.token) {
            TokenManager.setToken(response.data.token);
        }

        return response.data;
    },

    /**
     * Выход пользователя
     */
    async logout(): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);

        // Удаляем токен
        TokenManager.removeToken();
    },

    /**
     * Получить профиль текущего пользователя
     */
    async getProfile(): Promise<User> {
        const response = await apiClient.get<{ user: User }>(
            API_ENDPOINTS.AUTH.PROFILE
        );
        return response.data.user;
    },

    /**
     * Обновить профиль текущего пользователя
     */
    async updateProfile(data: UpdateProfileData): Promise<User> {
        const response = await apiClient.put<{ user: User }>(
            API_ENDPOINTS.AUTH.UPDATE_PROFILE,
            data
        );
        return response.data.user;
    },

    /**
     * Изменить пароль
     */
    async changePassword(data: ChangePasswordData): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    },

    /**
     * Запросить восстановление пароля
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
            { email }
        );
        return response.data;
    },

    /**
     * Сбросить пароль
     */
    async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            data
        );
        return response.data;
    },

    /**
     * Проверить, авторизован ли пользователь
     */
    isAuthenticated(): boolean {
        return TokenManager.hasToken();
    },
};


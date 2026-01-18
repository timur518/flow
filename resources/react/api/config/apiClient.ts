/**
 * API Client
 * Базовый клиент для работы с API на основе axios
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './apiConfig';
import { TokenManager } from '../utils/tokenManager';

/**
 * Создание экземпляра axios с базовой конфигурацией
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
});

/**
 * Request Interceptor
 * Добавляет токен авторизации к каждому запросу
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = TokenManager.getToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Обрабатывает ответы и ошибки
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError<any>) => {
        let errorMessage = 'Произошла ошибка';

        // Обработка ошибки 401 (Unauthorized)
        if (error.response?.status === 401) {
            // Удаляем токен и перенаправляем на страницу входа
            TokenManager.removeToken();
            errorMessage = 'Неверный логин или пароль';

            // Можно добавить редирект на страницу входа
            // window.location.href = '/login';
        }

        // Обработка ошибки 403 (Forbidden)
        else if (error.response?.status === 403) {
            errorMessage = 'Доступ запрещен';
        }

        // Обработка ошибки 404 (Not Found)
        else if (error.response?.status === 404) {
            errorMessage = 'Ресурс не найден';
        }

        // Обработка ошибки 422 (Validation Error)
        else if (error.response?.status === 422) {
            if (error.response.data?.errors) {
                // Собираем все ошибки валидации в список
                const errors = error.response.data.errors;
                const errorMessages: string[] = [];

                Object.keys(errors).forEach(field => {
                    const fieldErrors = errors[field];
                    if (Array.isArray(fieldErrors)) {
                        errorMessages.push(...fieldErrors);
                    } else {
                        errorMessages.push(fieldErrors);
                    }
                });

                // Формируем сообщение со всеми ошибками
                if (errorMessages.length > 1) {
                    errorMessage = errorMessages.map((msg, index) => `${index + 1}. ${msg}`).join('\n');
                } else {
                    errorMessage = errorMessages[0] || 'Ошибка валидации данных';
                }
            } else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = 'Ошибка валидации данных';
            }
        }

        // Обработка ошибки 500 (Server Error)
        else if (error.response?.status === 500) {
            errorMessage = 'Ошибка сервера. Попробуйте позже';
        }

        // Если есть сообщение от сервера, используем его
        else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        // Создаем новую ошибку с понятным сообщением
        const customError = new Error(errorMessage) as any;
        customError.response = error.response;
        customError.status = error.response?.status;

        return Promise.reject(customError);
    }
);

export default apiClient;


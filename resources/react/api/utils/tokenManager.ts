/**
 * Token Manager
 * Управление токеном аутентификации
 */

import { API_CONFIG } from '../config/apiConfig';

export class TokenManager {
    /**
     * Получить токен из localStorage
     */
    static getToken(): string | null {
        return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    }

    /**
     * Сохранить токен в localStorage
     */
    static setToken(token: string): void {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    }

    /**
     * Удалить токен из localStorage
     */
    static removeToken(): void {
        localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    }

    /**
     * Проверить наличие токена
     */
    static hasToken(): boolean {
        return !!this.getToken();
    }

    /**
     * Получить заголовок Authorization с токеном
     */
    static getAuthHeader(): { Authorization: string } | {} {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}


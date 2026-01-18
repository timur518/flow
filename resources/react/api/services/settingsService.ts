/**
 * Settings Service
 * Сервис для работы с настройками сайта
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, SiteSettings } from '../types';

export const settingsService = {
    /**
     * Получить настройки сайта
     */
    async getSettings(): Promise<SiteSettings> {
        const response = await apiClient.get<ApiResponse<SiteSettings>>(
            API_ENDPOINTS.SETTINGS
        );
        return response.data.data;
    },
};


/**
 * City Service
 * Сервис для работы с городами
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, City } from '../types';

export const cityService = {
    /**
     * Получить список городов
     */
    async getCities(): Promise<City[]> {
        const response = await apiClient.get<ApiResponse<City[]>>(
            API_ENDPOINTS.CITIES
        );
        return response.data.data;
    },
};


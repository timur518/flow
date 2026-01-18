/**
 * Category Service
 * Сервис для работы с категориями
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, Category, CategoryParams } from '../types';

export const categoryService = {
    /**
     * Получить список категорий
     */
    async getCategories(params?: CategoryParams): Promise<Category[]> {
        const response = await apiClient.get<ApiResponse<Category[]>>(
            API_ENDPOINTS.CATEGORIES,
            { params }
        );
        return response.data.data;
    },
};


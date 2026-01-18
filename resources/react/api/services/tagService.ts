/**
 * Tag Service
 * Сервис для работы с тегами
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, Tag, TagParams } from '../types';

export const tagService = {
    /**
     * Получить список тегов
     */
    async getTags(params?: TagParams): Promise<Tag[]> {
        const response = await apiClient.get<ApiResponse<Tag[]>>(
            API_ENDPOINTS.TAGS,
            { params }
        );
        return response.data.data;
    },
};


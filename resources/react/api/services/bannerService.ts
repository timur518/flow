/**
 * Banner Service
 * Сервис для работы с баннерами
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, Banner, BannerParams } from '../types';

export const bannerService = {
    /**
     * Получить список баннеров
     */
    async getBanners(params?: BannerParams): Promise<Banner[]> {
        const response = await apiClient.get<ApiResponse<Banner[]>>(
            API_ENDPOINTS.BANNERS,
            { params }
        );
        return response.data.data;
    },
};


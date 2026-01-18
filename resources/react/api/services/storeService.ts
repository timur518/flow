/**
 * Store Service
 * Сервис для работы с магазинами
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, Store, StoreDetail, StoreParams, DeliveryPeriod, DeliveryZone } from '../types';

export const storeService = {
    /**
     * Получить список магазинов
     */
    async getStores(params?: StoreParams): Promise<Store[]> {
        const response = await apiClient.get<ApiResponse<Store[]>>(
            API_ENDPOINTS.STORES,
            { params }
        );
        return response.data.data;
    },

    /**
     * Получить информацию о магазине
     */
    async getStore(id: number): Promise<StoreDetail> {
        const response = await apiClient.get<ApiResponse<StoreDetail>>(
            API_ENDPOINTS.STORE_DETAIL(id)
        );
        return response.data.data;
    },

    /**
     * Получить периоды доставки магазина
     */
    async getDeliveryPeriods(id: number): Promise<DeliveryPeriod[]> {
        const response = await apiClient.get<ApiResponse<DeliveryPeriod[]>>(
            API_ENDPOINTS.STORE_DELIVERY_PERIODS(id)
        );
        return response.data.data;
    },

    /**
     * Получить зоны доставки магазина
     */
    async getDeliveryZones(id: number): Promise<DeliveryZone[]> {
        const response = await apiClient.get<ApiResponse<DeliveryZone[]>>(
            API_ENDPOINTS.STORE_DELIVERY_ZONES(id)
        );
        return response.data.data;
    },
};


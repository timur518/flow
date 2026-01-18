/**
 * Product Service
 * Сервис для работы с товарами
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse, Product, ProductDetail, ProductParams } from '../types';

export const productService = {
    /**
     * Получить список товаров
     */
    async getProducts(params?: ProductParams): Promise<Product[]> {
        const response = await apiClient.get<ApiResponse<Product[]>>(
            API_ENDPOINTS.PRODUCTS,
            { params }
        );
        return response.data.data;
    },

    /**
     * Получить информацию о товаре
     */
    async getProduct(id: number): Promise<ProductDetail> {
        const response = await apiClient.get<ApiResponse<ProductDetail>>(
            API_ENDPOINTS.PRODUCT_DETAIL(id)
        );
        return response.data.data;
    },
};


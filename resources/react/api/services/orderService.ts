/**
 * Order Service
 * Сервис для работы с заказами
 */

import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import {
    Order,
    CreateOrderData,
    PromoCodeValidation,
    PromoCodeResponse,
    DeliveryCalculation,
    DeliveryCalculationResponse,
} from '../types';

export const orderService = {
    /**
     * Получить список заказов текущего пользователя
     */
    async getOrders(): Promise<Order[]> {
        const response = await apiClient.get<{ orders: Order[] }>(
            API_ENDPOINTS.ORDERS
        );
        return response.data.orders;
    },

    /**
     * Получить заказ по ID
     */
    async getOrder(id: number): Promise<Order> {
        const response = await apiClient.get<{ order: Order }>(
            API_ENDPOINTS.ORDER_DETAIL(id)
        );
        return response.data.order;
    },

    /**
     * Создать новый заказ
     */
    async createOrder(data: CreateOrderData): Promise<{
        order: Order;
        payment_url?: string | null;
        message?: string;
    }> {
        const response = await apiClient.post<{
            order: Order;
            payment_url?: string | null;
            message?: string;
        }>(API_ENDPOINTS.ORDERS, data);
        return response.data;
    },

    /**
     * Валидировать промокод
     */
    async validatePromoCode(data: PromoCodeValidation): Promise<PromoCodeResponse> {
        const response = await apiClient.post<PromoCodeResponse>(
            API_ENDPOINTS.PROMO_CODE_VALIDATE,
            data
        );
        return response.data;
    },

    /**
     * Рассчитать стоимость доставки
     */
    async calculateDelivery(data: DeliveryCalculation): Promise<DeliveryCalculationResponse> {
        const response = await apiClient.post<DeliveryCalculationResponse>(
            API_ENDPOINTS.DELIVERY_CALCULATE,
            data
        );
        return response.data;
    },
};


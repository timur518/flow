/**
 * useOrders Hook
 * Хук для работы с заказами
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/api/services';
import {
    Order,
    CreateOrderData,
    PromoCodeValidation,
    PromoCodeResponse,
    DeliveryCalculation,
    DeliveryCalculationResponse,
} from '@/api/types';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrders();
            setOrders(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки заказов');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const createOrder = useCallback(async (data: CreateOrderData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderService.createOrder(data);
            await fetchOrders(); // Обновляем список заказов
            return response;
        } catch (err: any) {
            setError(err.message || 'Ошибка создания заказа');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchOrders]);

    return { orders, loading, error, createOrder, refetch: fetchOrders };
};

export const useOrder = (id: number) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await orderService.getOrder(id);
                setOrder(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки заказа');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    return { order, loading, error };
};

export const usePromoCode = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validatePromoCode = useCallback(async (data: PromoCodeValidation): Promise<PromoCodeResponse | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderService.validatePromoCode(data);
            return response;
        } catch (err: any) {
            setError(err.message || 'Ошибка валидации промокода');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { validatePromoCode, loading, error };
};

export const useDeliveryCalculation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateDelivery = useCallback(async (data: DeliveryCalculation): Promise<DeliveryCalculationResponse | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderService.calculateDelivery(data);
            return response;
        } catch (err: any) {
            setError(err.message || 'Ошибка расчета доставки');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { calculateDelivery, loading, error };
};


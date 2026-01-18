/**
 * useStores Hook
 * Хук для работы с магазинами
 */

import { useState, useEffect } from 'react';
import { storeService } from '@/api/services';
import { Store, StoreDetail, StoreParams } from '@/api/types';

export const useStores = (params?: StoreParams) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                const data = await storeService.getStores(params);
                setStores(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки магазинов');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [params?.city_id]);

    return { stores, loading, error };
};

export const useStore = (id: number | null) => {
    const [store, setStore] = useState<StoreDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStore = async () => {
            if (!id) {
                setStore(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await storeService.getStore(id);
                setStore(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки магазина');
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [id]);

    return { store, loading, error };
};


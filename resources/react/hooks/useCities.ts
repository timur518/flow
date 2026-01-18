/**
 * useCities - Хук для работы с городами
 */

import { useState, useEffect } from 'react';
import { cityService } from '@/api/services';
import { City } from '@/api/types';

export const useCities = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCities();
    }, []);

    const loadCities = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cityService.getCities();
            setCities(data);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки городов');
        } finally {
            setLoading(false);
        }
    };

    return {
        cities,
        loading,
        error,
        refetch: loadCities,
    };
};


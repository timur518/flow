/**
 * CitiesContext - Контекст для списка городов
 * Загружает города один раз и кеширует их
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cityService } from '@/api/services';
import { City } from '@/api/types';

interface CitiesContextType {
    cities: City[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const CitiesContext = createContext<CitiesContextType | undefined>(undefined);

interface CitiesProviderProps {
    children: ReactNode;
}

export const CitiesProvider: React.FC<CitiesProviderProps> = ({ children }) => {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        loadCities();
    }, []);

    return (
        <CitiesContext.Provider value={{ cities, loading, error, refetch: loadCities }}>
            {children}
        </CitiesContext.Provider>
    );
};

export const useCities = (): CitiesContextType => {
    const context = useContext(CitiesContext);
    if (!context) {
        throw new Error('useCities must be used within CitiesProvider');
    }
    return context;
};


/**
 * CityContext - Контекст для управления выбранным городом
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useCities } from '@/hooks';

interface CityContextType {
    selectedCityId: number | null;
    setSelectedCityId: (cityId: number) => void;
}

export const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
    children: ReactNode;
}

export const CityProvider: React.FC<CityProviderProps> = ({ children }) => {
    const { cities } = useCities();
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

    // Выбираем первый город по умолчанию
    useEffect(() => {
        if (cities.length > 0 && !selectedCityId) {
            setSelectedCityId(cities[0].id);
        }
    }, [cities, selectedCityId]);

    return (
        <CityContext.Provider value={{ selectedCityId, setSelectedCityId }}>
            {children}
        </CityContext.Provider>
    );
};


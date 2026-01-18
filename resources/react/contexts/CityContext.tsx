/**
 * CityContext - Контекст для управления выбранным городом
 */

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCities } from './CitiesContext';
import { CookieManager } from '@/api/utils/cookieManager';
import { AuthContext } from './AuthContext';
import { authService } from '@/api/services';

interface CityContextType {
    selectedCityId: number | null;
    setSelectedCityId: (cityId: number) => void;
    isInitialized: boolean;
}

export const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
    children: ReactNode;
}

export const CityProvider: React.FC<CityProviderProps> = ({ children }) => {
    const { cities, loading: citiesLoading } = useCities();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const authContext = useContext(AuthContext);

    // Инициализация города из разных источников (приоритет: URL > профиль > cookies > первый город)
    useEffect(() => {
        // Ждем загрузки городов
        if (citiesLoading || cities.length === 0) {
            return;
        }

        // Ждем загрузки AuthContext
        if (!authContext) {
            return;
        }

        // Если AuthContext еще загружается, ждем
        if (authContext.loading) {
            return;
        }

        // Если уже инициализирован, не инициализируем повторно
        if (isInitialized) {
            return;
        }

        const initializeCity = () => {
            const cityParam = searchParams.get('city');

            // 1. Приоритет: параметр в URL
            if (cityParam) {
                const cityId = parseInt(cityParam, 10);
                const cityExists = cities.find(c => c.id === cityId);

                if (cityExists) {
                    setSelectedCityId(cityId);
                    setIsInitialized(true);
                    return;
                }
            }

            // 2. Если пользователь авторизован, берем город из профиля
            if (authContext.user?.city_id) {
                const cityExists = cities.find(c => c.id === authContext.user.city_id);

                if (cityExists) {
                    setSelectedCityId(authContext.user.city_id);
                    setIsInitialized(true);
                    return;
                }
            }

            // 3. Если пользователь не авторизован, берем из cookies
            if (!authContext.user) {
                const cookieCityId = CookieManager.getCityId();

                if (cookieCityId) {
                    const cityExists = cities.find(c => c.id === cookieCityId);

                    if (cityExists) {
                        setSelectedCityId(cookieCityId);
                        setIsInitialized(true);
                        return;
                    }
                }
            }

            // 4. По умолчанию выбираем первый город
            setSelectedCityId(cities[0].id);
            setIsInitialized(true);
        };

        initializeCity();
    }, [cities, citiesLoading, searchParams, authContext, authContext?.loading, authContext?.user, isInitialized]);

    // Обновляем город при изменении пользователем
    const handleSetSelectedCityId = async (cityId: number) => {
        setSelectedCityId(cityId);

        // Обновляем URL параметр
        const newParams = new URLSearchParams(searchParams);
        newParams.set('city', cityId.toString());
        setSearchParams(newParams);

        // Сохраняем в зависимости от статуса авторизации
        if (authContext?.user) {
            // Для авторизованных пользователей - обновляем профиль
            try {
                await authContext.updateProfile({ city_id: cityId });
            } catch (error) {
                console.error('Ошибка обновления города в профиле:', error);
            }
        } else {
            // Для неавторизованных - сохраняем в cookies
            CookieManager.setCityId(cityId);
        }
    };

    return (
        <CityContext.Provider value={{
            selectedCityId,
            setSelectedCityId: handleSetSelectedCityId,
            isInitialized
        }}>
            {children}
        </CityContext.Provider>
    );
};


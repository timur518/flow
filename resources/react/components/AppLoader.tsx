/**
 * AppLoader - Компонент для предзагрузки критичных данных
 *
 * Загружает необходимые данные до отрисовки основного приложения:
 * - Настройки
 * - Проверка авторизации
 * - Инициализация города
 *
 * Показывает красивый экран загрузки во время загрузки данных
 */

import React, { useEffect, useState } from 'react';
import { useSettings, useCities } from '@/contexts';
import { useAuth, useCity } from '@/hooks';

interface AppLoaderProps {
    children: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
    const { settings, loading: settingsLoading } = useSettings();
    const { user, loading: authLoading } = useAuth();
    const { cities, loading: citiesLoading } = useCities();
    const { isInitialized: cityInitialized } = useCity();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        // Проверяем, что все критичные данные загружены
        if (!settingsLoading && !authLoading && !citiesLoading && cityInitialized) {
            // Небольшая задержка для плавности
            const timer = setTimeout(() => {
                setShowLoader(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [settingsLoading, authLoading, citiesLoading, cityInitialized]);

    const isLoading = settingsLoading || authLoading || citiesLoading || !cityInitialized;

    return (
        <>
            {/* Прелоадер поверх контента */}
            {showLoader && (
                <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 transition-opacity duration-300">
                    <div className="text-center">
                        {/* Индикатор загрузки */}
                        <div className="flex flex-col items-center gap-4">
                            {/* Спиннер */}
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-pink-300 rounded-full border-t-transparent animate-spin"></div>
                            </div>

                            {/* Текст загрузки */}
                            <div className="text-sm text-gray-600">
                                {settingsLoading && <p>Загрузка настроек...</p>}
                                {authLoading && <p>Проверка авторизации...</p>}
                                {citiesLoading && <p>Загрузка городов...</p>}
                                {!settingsLoading && !authLoading && !citiesLoading && !cityInitialized && (
                                    <p>Определение города...</p>
                                )}
                                {!settingsLoading && !authLoading && !citiesLoading && cityInitialized && (
                                    <p>Подготовка...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Контент рендерится сразу, но скрыт пока показывается прелоадер */}
            <div className={showLoader ? 'invisible' : 'visible'}>
                {children}
            </div>
        </>
    );
};

export default AppLoader;


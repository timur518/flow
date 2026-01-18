/**
 * AppLoader - Компонент для предзагрузки критичных данных
 *
 * Загружает необходимые данные до отрисовки основного приложения:
 * - Настройки
 * - Проверка авторизации
 *
 * Показывает красивый экран загрузки во время загрузки данных
 */

import React, { useEffect, useState } from 'react';
import { useSettings, useAuth } from '@/hooks';

interface AppLoaderProps {
    children: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
    const { settings, loading: settingsLoading } = useSettings();
    const { user, loading: authLoading } = useAuth();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Проверяем, что все критичные данные загружены
        if (!settingsLoading && !authLoading) {
            // Небольшая задержка для плавности
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [settingsLoading, authLoading]);

    // Показываем экран загрузки
    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    {/* Логотип из настроек */}
                    {settings?.appearance?.logo_url && (
                        <div className="mb-8 flex justify-center">
                            <img
                                src={settings.appearance.logo_url}
                                alt={settings.site_brand || 'Logo'}
                                className="h-24 w-auto object-contain"
                            />
                        </div>
                    )}

                    {/* Индикатор загрузки */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Спиннер */}
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>

                        {/* Текст загрузки */}
                        <div className="text-sm text-gray-600">
                            {settingsLoading && <p>Загрузка настроек...</p>}
                            {authLoading && <p>Проверка авторизации...</p>}
                            {!settingsLoading && !authLoading && (
                                <p>Подготовка...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Данные загружены, показываем приложение
    return <>{children}</>;
};

export default AppLoader;


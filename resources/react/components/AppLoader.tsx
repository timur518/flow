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
                    {/* Логотип или иконка */}
                    <div className="mb-8 flex justify-center">
                        {settings?.appearance?.logo_url ? (
                            <img
                                src={settings.appearance.logo_url}
                                alt={settings.site_brand || 'Logo'}
                                className="h-24 w-auto object-contain animate-pulse"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse">
                                <span className="text-5xl">🌸</span>
                            </div>
                        )}
                    </div>

                    {/* Название */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {settings?.site_brand || 'FlowerShop'}
                    </h1>
                    <p className="text-gray-600 mb-8">Доставка цветов</p>

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

                    {/* Прогресс бар */}
                    <div className="mt-8 w-64 mx-auto">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                                style={{
                                    width: `${
                                        ((!settingsLoading ? 50 : 0) +
                                         (!authLoading ? 50 : 0))
                                    }%`
                                }}
                            ></div>
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


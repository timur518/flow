/**
 * SettingsContext - Контекст для настроек сайта
 * Загружает настройки один раз и кеширует их
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '@/api/services';
import { SiteSettings } from '@/api/types';

interface SettingsContextType {
    settings: SiteSettings | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.getSettings();
            setSettings(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки настроек');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, error, refetch: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};


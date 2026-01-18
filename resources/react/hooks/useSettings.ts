/**
 * useSettings Hook
 * Хук для работы с настройками сайта
 */

import { useState, useEffect } from 'react';
import { settingsService } from '@/api/services';
import { SiteSettings } from '@/api/types';

export const useSettings = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

        fetchSettings();
    }, []);

    return { settings, loading, error };
};


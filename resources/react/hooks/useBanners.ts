/**
 * useBanners Hook
 * Хук для работы с баннерами
 */

import { useState, useEffect } from 'react';
import { bannerService } from '@/api/services';
import { Banner, BannerParams } from '@/api/types';

export const useBanners = (params?: BannerParams) => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const data = await bannerService.getBanners(params);
                setBanners(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки баннеров');
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, [params?.city_id]);

    return { banners, loading, error };
};


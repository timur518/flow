/**
 * useTags Hook
 * Хук для работы с тегами
 */

import { useState, useEffect } from 'react';
import { tagService } from '@/api/services';
import { Tag, TagParams } from '@/api/types';

export const useTags = (params?: TagParams) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                setLoading(true);
                const data = await tagService.getTags(params);
                setTags(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки тегов');
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [params?.include_inactive]);

    return { tags, loading, error };
};


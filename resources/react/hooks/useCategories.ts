/**
 * useCategories Hook
 * Хук для работы с категориями
 */

import { useState, useEffect } from 'react';
import { categoryService } from '@/api/services';
import { Category, CategoryParams } from '@/api/types';

export const useCategories = (params?: CategoryParams) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await categoryService.getCategories(params);
                setCategories(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки категорий');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [params?.include_inactive]);

    return { categories, loading, error };
};


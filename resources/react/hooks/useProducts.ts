/**
 * useProducts Hook
 * Хук для работы с товарами
 */

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/api/services';
import { Product, ProductDetail, ProductParams } from '@/api/types';

export const useProducts = (params?: ProductParams) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts(params);
            setProducts(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки товаров');
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (id: number) => {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProduct(id);
                setProduct(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Ошибка загрузки товара');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    return { product, loading, error };
};


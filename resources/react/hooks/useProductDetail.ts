import { useState, useEffect } from 'react';
import { ProductDetail } from '@/api/types';
import apiClient from '@/api/config/apiClient';

export const useProductDetail = (productId: number | null) => {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) {
            setProduct(null);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get<{ success: boolean; data: ProductDetail }>(
                    `/products/${productId}`
                );
                setProduct(response.data.data);
            } catch (err) {
                setError('Не удалось загрузить товар');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    return { product, loading, error };
};


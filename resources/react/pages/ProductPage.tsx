/**
 * ProductPage - Страница товара
 * Открывает главную страницу с модальным окном товара
 * URL: /:categorySlug/:productId
 */

import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { useProductDetail, useModals } from '@/hooks';
import { ProductSchema } from '@/components/common';

const ProductPage: React.FC = () => {
    const { productId } = useParams<{ categorySlug: string; productId: string }>();
    const navigate = useNavigate();
    const { openProductModal } = useModals();
    const hasOpenedModal = useRef(false);

    const { product, loading } = useProductDetail(productId ? parseInt(productId, 10) : null);

    useEffect(() => {
        // Когда товар загружен, открываем модальное окно через глобальный контекст
        if (product && !loading && !hasOpenedModal.current) {
            hasOpenedModal.current = true;
            openProductModal(product);
        }
    }, [product, loading, openProductModal]);

    // Сбрасываем флаг при изменении productId
    useEffect(() => {
        hasOpenedModal.current = false;
    }, [productId]);

    return (
        <>
            {/* Schema.org разметка для поисковиков (невидима для пользователей) */}
            <ProductSchema product={product} />
            <HomePage />
        </>
    );
};

export default ProductPage;


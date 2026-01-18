/**
 * ProductPage - Страница товара
 * Открывает главную страницу с модальным окном товара
 * URL: /:categorySlug/:productId
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { useProductDetail } from '@/hooks';
import { Product } from '@/api/types';

const ProductPage: React.FC = () => {
    const { categorySlug, productId } = useParams<{ categorySlug: string; productId: string }>();
    const navigate = useNavigate();
    const [shouldOpenModal, setShouldOpenModal] = useState(false);
    
    const { product, loading } = useProductDetail(productId ? parseInt(productId, 10) : null);

    useEffect(() => {
        // Когда товар загружен, устанавливаем флаг для открытия модального окна
        if (product && !loading) {
            setShouldOpenModal(true);
        }
    }, [product, loading]);

    const handleCloseModal = () => {
        // При закрытии модального окна возвращаемся на главную
        navigate('/');
    };

    // Передаем информацию о товаре в HomePage через props
    return (
        <HomePage 
            initialProduct={product as Product | null}
            initialModalOpen={shouldOpenModal}
            onModalClose={handleCloseModal}
        />
    );
};

export default ProductPage;


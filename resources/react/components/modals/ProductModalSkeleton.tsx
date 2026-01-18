/**
 * ProductModalSkeleton - Скелетон для загрузки ProductModal
 */

import React from 'react';

const ProductModalSkeleton: React.FC = () => {
    return (
        <div className="product-modal-content">
            {/* Левая колонка - Слайдер */}
            <div className="product-modal-slider">
                <div className="product-modal-slider-wrapper">
                    <div className="product-modal-image-container">
                        <div className="skeleton skeleton-image"></div>
                    </div>
                </div>
            </div>

            {/* Центральная колонка - Описание */}
            <div className="product-modal-info">
                <div className="product-modal-info-content">
                    {/* Название */}
                    <div className="skeleton skeleton-title"></div>
                    
                    {/* Описание */}
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                </div>

                <div className="product-modal-info-footer">
                    {/* Цена */}
                    <div className="skeleton skeleton-price"></div>
                    
                    {/* Кнопки */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div className="skeleton skeleton-button" style={{ width: '100px' }}></div>
                        <div className="skeleton skeleton-button" style={{ flex: 1 }}></div>
                    </div>
                </div>
            </div>

            {/* Правая колонка - Рекомендации */}
            <div className="product-modal-recommendations">
                <div className="product-modal-recommendations-header">
                    <div className="skeleton skeleton-heading"></div>
                </div>
                <div className="product-modal-recommendations-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton skeleton-card"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductModalSkeleton;


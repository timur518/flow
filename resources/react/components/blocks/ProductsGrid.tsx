/**
 * ProductsGrid - Сетка товаров на главной странице
 * Отображает все товары для выбранного города
 * Использует ProductCard для отображения каждого товара
 */

import React from 'react';
import { useProducts, useCart, useCity } from '@/hooks';
import { Product } from '@/api/types';
import ProductCard from './ProductCard';

interface ProductsGridProps {
    onProductClick?: (product: Product) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ onProductClick }) => {
    const { selectedCityId } = useCity();

    // Загружаем все товары для выбранного города
    const { products, loading } = useProducts({
        city_id: selectedCityId || undefined,
        limit: 8
    });
    const { addItem } = useCart();

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.sale_price || product.price,
            quantity: 1,
            image: product.image,
        });
    };

    if (loading) {
        return (
            <section className="block-container">
                <h2 className="products-grid-title">Наши товары</h2>
                <div className="products-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="product-skeleton">
                            <div className="product-skeleton-image"></div>
                            <div className="product-skeleton-content">
                                <div className="product-skeleton-title"></div>
                                <div className="product-skeleton-price"></div>
                                <div className="product-skeleton-button"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="block-container">
            <h2 className="products-grid-title">Наши товары</h2>

            {products.length === 0 ? (
                <div className="products-grid-empty">
                    <p className="products-grid-empty-text">Нет доступных товаров</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={onProductClick}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductsGrid;


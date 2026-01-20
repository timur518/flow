/**
 * ProductsGrid - Универсальная сетка товаров
 * Отображает товары с различными фильтрами и настройками
 * Использует ProductCard для отображения каждого товара
 */

import React from 'react';
import { useProducts, useCart, useCity } from '@/hooks';
import { Product, ProductParams } from '@/api/types';
import ProductCard from './ProductCard';

interface ProductsGridProps {
    /** Заголовок блока */
    title?: string;
    /** ID категории для фильтрации */
    category_id?: number;
    /** Показывать только товары со скидкой */
    on_sale?: boolean;
    /** Случайный порядок товаров */
    random?: boolean;
    /** Количество товаров */
    limit?: number;
    /** Показывать кнопку "Смотреть все" */
    showViewAll?: boolean;
    /** URL для кнопки "Смотреть все" */
    viewAllUrl?: string;
    /** Обработчик клика по товару */
    onProductClick?: (product: Product) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
    title = 'Наши товары',
    category_id,
    on_sale,
    random,
    limit = 8,
    showViewAll = false,
    viewAllUrl,
    onProductClick
}) => {
    const { selectedCityId } = useCity();

    // Формируем параметры запроса
    const params: ProductParams = {
        city_id: selectedCityId || undefined,
        category_id,
        on_sale,
        random,
        limit
    };

    // Загружаем товары с заданными параметрами
    const { products, loading } = useProducts(params);
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="products-grid-title">{title}</h2>
                    {showViewAll && viewAllUrl && (
                        <a
                            href={viewAllUrl}
                            className="view-all-button"
                        >
                            Показать все
                        </a>
                    )}
                </div>
                <div className="products-grid">
                    {Array.from({ length: limit }, (_, i) => i + 1).map((i) => (
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="products-grid-title">{title}</h2>
                {showViewAll && viewAllUrl && products.length > 0 && (
                    <a
                        href={viewAllUrl}
                        className="view-all-button"
                    >
                        Показать все
                    </a>
                )}
            </div>

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


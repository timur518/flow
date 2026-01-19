/**
 * ProductCard - Карточка товара
 *
 * Отображает информацию о товаре:
 * - Первая фотография товара
 * - На картинке: размер скидки и один тег
 * - Название товара
 * - Цена без скидки (зачеркнутая)
 * - Цена со скидкой
 * - Кнопка "Добавить в корзину"
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/api/types';
import { useCart } from '@/hooks';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
    const { items, removeItem } = useCart();

    // Проверяем, есть ли товар в корзине
    const isInCart = items.some(item => item.id === product.id);

    // Вычисляем процент скидки
    const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);
    const discountPercent = hasDiscount
        ? Math.round(((parseFloat(product.price) - parseFloat(product.sale_price!)) / parseFloat(product.price)) * 100)
        : 0;

    // Берем первый тег для отображения (tags - это массив)
    const firstTag = product.tags?.length > 0 ? product.tags[0] : null;

    // Берем первую категорию для формирования URL
    const firstCategory = product.categories?.length > 0 ? product.categories[0] : null;
    const productUrl = firstCategory ? `/${firstCategory.slug}/${product.id}` : '#';

    const handleCardClick = (e: React.MouseEvent) => {
        // Если есть onClick, используем его (для модального окна)
        // Иначе переход по ссылке произойдет автоматически
        if (onClick) {
            e.preventDefault();
            onClick(product);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product);
        }
    };

    const handleRemoveFromCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeItem(product.id);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <Link
            to={productUrl}
            className="product-card"
            onClick={handleCardClick}
        >
            {/* Изображение с бейджами */}
            <div className="product-image-container">
                {/* Первая фотография товара */}
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                    />
                ) : (
                    <div className="product-image-placeholder">
                        🌸
                    </div>
                )}

                {/* Бейджи на картинке */}
                <div className="product-tags">
                    {/* Бейдж скидки (слева) */}
                    {hasDiscount && (
                        <div className="product-discount-tag">
                            -{discountPercent}%
                        </div>
                    )}

                    {/* Тег товара (рядом со скидкой или слева если нет скидки) */}
                    {firstTag && (
                        <div
                            className="product-tag"
                            style={{
                                backgroundColor: firstTag.color,
                            }}
                        >
                            {firstTag.name}
                        </div>
                    )}
                </div>
            </div>

            {/* Информация о товаре */}
            <div className="product-info">
                {/* Название товара */}
                <h3 className="product-name">
                    {product.name}
                </h3>

                {/* Кнопка "Добавить в корзину" с ценами */}
                <div className={`product-add-button ${isInCart ? 'active' : ''}`} onClick={handleButtonClick}>
                    {/* Минус (слева) - показываем только если товар в корзине */}
                    {isInCart && (
                        <div
                            className="product-remove-icon"
                            onClick={handleRemoveFromCart}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}

                    {hasDiscount && (
                        /* Старая цена (зачеркнутая) */
                        <div className="product-price-old" onClick={handleAddToCart}>
                            {parseFloat(product.price).toLocaleString('ru-RU')} ₽
                        </div>
                    )}

                    {/* Актуальная цена (по центру) - sale_price если есть, иначе price */}
                    <div className="product-price-sale" onClick={handleAddToCart}>
                        {parseFloat(product.sale_price || product.price).toLocaleString('ru-RU')} ₽
                    </div>

                    {/* Плюсик (справа) */}
                    <div
                        className="product-add-icon"
                        onClick={handleAddToCart}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;


/**
 * ProductModal - Модальное окно с подробной информацией о товаре
 * 3 колонки: слайдер фото | информация | рекомендации
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ProductModalSkeleton from './ProductModalSkeleton';
import { Product } from '@/api/types';
import { useProductDetail, useProducts, useCart } from '@/hooks';
import ProductCard from '../blocks/ProductCard';
import { Close, ArrowsVertical, ArrowsHorizontal } from '@/components/icons';
import { yandexMetrikaService } from '@/api/services';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onAddToCart?: (product: Product, quantity: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    product,
    onAddToCart,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);

    const { product: productDetail, loading } = useProductDetail(product?.id || null);
    const { products: recommendations } = useProducts({ limit: 4, category_id: 13 });
    const { addItem } = useCart();

    // Сброс состояния при смене товара
    useEffect(() => {
        if (product) {
            setQuantity(1);
            setCurrentImageIndex(0);
        }
    }, [product?.id]);

    // Отправка события "Просмотр товара" в Яндекс Метрику
    useEffect(() => {
        if (isOpen && productDetail) {
            yandexMetrikaService.viewProduct(productDetail);
        }
    }, [isOpen, productDetail]);

    if (!product) return null;

    const detail = productDetail || product;
    const hasDiscount = detail.sale_price && parseFloat(detail.sale_price) < parseFloat(detail.price);
    const discountPercent = hasDiscount
        ? Math.round(((parseFloat(detail.price) - parseFloat(detail.sale_price!)) / parseFloat(detail.price)) * 100)
        : 0;

    const images = productDetail?.images || (product.image ? [{ id: 0, image: product.image, sort_order: 0 }] : []);
    const firstTag = detail.tags?.length > 0 ? detail.tags[0] : null;

    const handleAddToCart = () => {
        // Отправка события "Добавление в корзину" в Яндекс Метрику
        yandexMetrikaService.addToCart(detail, quantity);

        if (onAddToCart) {
            onAddToCart(product, quantity);
        } else {
            // Получаем первую категорию для сохранения в корзине
            const category = detail.categories && detail.categories.length > 0
                ? detail.categories[0].name
                : undefined;

            addItem({
                id: product.id,
                name: product.name,
                price: product.sale_price || product.price,
                quantity,
                image: product.image,
                category: category,
            });
        }
        onClose();
    };

    // Обработчики для drag-to-scroll
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Определяем направление свайпа (горизонтальный свайп должен быть больше вертикального)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0 && currentImageIndex > 0) {
                // Свайп вправо - предыдущее изображение
                setCurrentImageIndex(currentImageIndex - 1);
                setIsDragging(false);
            } else if (deltaX < 0 && currentImageIndex < images.length - 1) {
                // Свайп влево - следующее изображение
                setCurrentImageIndex(currentImageIndex + 1);
                setIsDragging(false);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        // Определяем направление свайпа
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0 && currentImageIndex > 0) {
                setCurrentImageIndex(currentImageIndex - 1);
            } else if (deltaX < 0 && currentImageIndex < images.length - 1) {
                setCurrentImageIndex(currentImageIndex + 1);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            {loading ? (
                <ProductModalSkeleton />
            ) : (
            <div className="product-modal-content">
                {/* Колонка 1: Слайдер фотографий */}
                <div className="product-modal-slider">
                    <div className="product-modal-slider-wrapper">
                        <div
                            className="product-modal-image-container"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            {images.length > 0 ? (
                                <img
                                    src={images[currentImageIndex].image}
                                    alt={detail.name}
                                    className="product-modal-image"
                                />
                            ) : (
                                <div className="product-modal-image-placeholder">🌸</div>
                            )}

                            {/* Бейджи сверху */}
                            <div className="product-modal-badges">
                                {firstTag && (
                                    <div
                                        className="product-modal-tag"
                                        style={{ backgroundColor: firstTag.color }}
                                    >
                                        {firstTag.name}
                                    </div>
                                )}
                                {hasDiscount && (
                                    <div className="product-modal-discount">
                                        -{discountPercent}%
                                    </div>
                                )}
                            </div>

                            {/* Размеры внизу слева */}
                            {(detail.width || detail.height) && (
                                <div className="product-modal-dimensions">
                                    {detail.height && (
                                        <div className="product-modal-dimension-item">
                                            <ArrowsVertical className="product-modal-dimension-icon" />
                                            {detail.height} см
                                        </div>
                                    )}
                                    {detail.width && (
                                        <div className="product-modal-dimension-item">
                                            <ArrowsHorizontal className="product-modal-dimension-icon" />
                                            {detail.width} см
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Переключатели слайдера внизу справа */}
                            {images.length > 1 && (
                                <div className="product-modal-slider-dots">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`product-modal-slider-dot ${
                                                idx === currentImageIndex ? 'active' : ''
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Кнопки навигации стрелками */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                                        disabled={currentImageIndex === 0}
                                        className={`product-modal-slider-nav product-modal-slider-nav-prev ${
                                            currentImageIndex === 0 ? 'disabled' : ''
                                        }`}
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                                        disabled={currentImageIndex === images.length - 1}
                                        className={`product-modal-slider-nav product-modal-slider-nav-next ${
                                            currentImageIndex === images.length - 1 ? 'disabled' : ''
                                        }`}
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Колонка 2: Информация */}
                <div className="product-modal-info">
                    {/* Заголовок и кнопка закрыть */}
                    <div className="product-modal-header">
                        <h2 className="product-modal-title">{detail.name}</h2>
                        <button
                            onClick={onClose}
                            className="product-modal-close btn-circle-35 bg-white"
                        >
                            <Close className="product-modal-close-icon" />
                        </button>
                    </div>

                    {/* Состав */}
                    {productDetail?.ingredients && productDetail.ingredients.length > 0 && (
                        <div className="product-modal-section">
                            <h3 className="product-modal-section-title">Состав</h3>
                            <ul className="product-modal-ingredients">
                                {productDetail.ingredients.map((ing) => (
                                    <li key={ing.id} className="product-modal-ingredient">
                                        {ing.name} — {ing.quantity} шт
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {productDetail?.ingredients && productDetail.ingredients.length > 0 && (
                        <div className="product-modal-divider" />
                    )}

                    {/* Описание */}
                    {productDetail?.description && (
                        <>
                            <div className="product-modal-section">
                                <h3 className="product-modal-section-title">Описание</h3>
                                <div
                                    className="product-modal-description"
                                    dangerouslySetInnerHTML={{ __html: productDetail.description }}
                                />
                            </div>
                            <div className="product-modal-divider" />
                        </>
                    )}

                    {/* Размеры */}
                    {(detail.width || detail.height) && (
                        <div className="product-modal-section">
                            <h3 className="product-modal-section-title">Размеры</h3>
                            <div className="product-modal-sizes">
                                {detail.height && (
                                    <div className="product-modal-size-item">
                                        <div className="product-modal-size-value">{detail.height} см</div>
                                        <div className="product-modal-size-label">Высота</div>
                                    </div>
                                )}
                                {detail.width && (
                                    <div className="product-modal-size-item">
                                        <div className="product-modal-size-value">{detail.width} см</div>
                                        <div className="product-modal-size-label">Ширина</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Количество и цены */}
                    <div className="product-modal-footer">
                        <div className="product-modal-quantity-price">
                            <div className="product-modal-quantity">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="product-modal-quantity-btn"
                                >
                                    -
                                </button>
                                <span className="product-modal-quantity-value">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="product-modal-quantity-btn"
                                >
                                    +
                                </button>
                            </div>

                            <div className="product-modal-prices">
                                {hasDiscount && (
                                    <div className="product-modal-price-old">
                                        {parseFloat(detail.price).toLocaleString('ru-RU')} ₽
                                    </div>
                                )}
                                <div className="product-modal-price-current">
                                    {parseFloat(detail.sale_price || detail.price).toLocaleString('ru-RU')} ₽
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="product-modal-add-button"
                        >
                            Добавить в корзину
                        </button>
                    </div>
                </div>

                {/* Колонка 3: Рекомендации */}
                <div className="product-modal-recommendations">
                    <h3 className="product-modal-recommendations-title">Добавить к заказу?</h3>
                    <div className="product-modal-recommendations-grid">
                        {recommendations.slice(0, 4).map((rec) => (
                            <ProductCard
                                key={rec.id}
                                product={rec}
                                onClick={() => {}}
                                onAddToCart={(p) => addItem({
                                    id: p.id,
                                    name: p.name,
                                    price: p.sale_price || p.price,
                                    quantity: 1,
                                    image: p.image,
                                })}
                            />
                        ))}
                    </div>
                </div>
            </div>
            )}
        </Modal>
    );
};

export default ProductModal;


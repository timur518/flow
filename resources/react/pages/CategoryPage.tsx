/**
 * CategoryPage - Страница категории товаров
 *
 * Содержит:
 * - Хлебные крошки
 * - Название категории
 * - Фильтры по тегам
 * - Сортировка товаров
 * - Список товаров
 * - Блок "Ищу подарок" (карусель тегов)
 * - Блок "Собрать свой букет"
 */

import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useCategories, useProducts, useCity, useCart, useTags } from '@/hooks';
import { Product, ProductTag } from '@/api/types';
import { Header, Footer } from '@/components';
import { CategoriesSidebar, CartSidebar, BouquetBuilder, ProductCard } from '@/components/blocks';
import { ProductModal } from '@/components/modals';
import { SortLines, Close, ChevronRight } from '@/components/icons';

type SortOption = 'price_asc' | 'price_desc' | null;

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { categories, loading: categoriesLoading } = useCategories();
    const { selectedCityId } = useCity();
    const { addItem } = useCart();
    const { tags: allTags } = useTags();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>(null);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [carouselOffset, setCarouselOffset] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Находим категорию по slug
    const category = useMemo(() => {
        return categories.find(c => c.slug === slug);
    }, [categories, slug]);

    // Загружаем товары для этой категории
    const { products: allProducts, loading: productsLoading } = useProducts({
        city_id: selectedCityId || undefined,
        category_id: category?.id,
    });

    // Получаем уникальные теги из товаров категории
    const categoryTags = useMemo(() => {
        const tagsMap = new Map<number, ProductTag>();
        allProducts.forEach(product => {
            product.tags.forEach(tag => {
                if (!tagsMap.has(tag.id)) {
                    tagsMap.set(tag.id, tag);
                }
            });
        });
        return Array.from(tagsMap.values());
    }, [allProducts]);

    // Фильтруем товары по выбранным тегам
    const filteredProducts = useMemo(() => {
        if (selectedTags.length === 0) {
            return allProducts;
        }
        return allProducts.filter(product =>
            selectedTags.every(tagId =>
                product.tags.some(tag => tag.id === tagId)
            )
        );
    }, [allProducts, selectedTags]);

    // Сортируем товары
    const products = useMemo(() => {
        const sorted = [...filteredProducts];
        if (sortBy === 'price_asc') {
            sorted.sort((a, b) => {
                const priceA = parseFloat(a.sale_price || a.price);
                const priceB = parseFloat(b.sale_price || b.price);
                return priceA - priceB;
            });
        } else if (sortBy === 'price_desc') {
            sorted.sort((a, b) => {
                const priceA = parseFloat(a.sale_price || a.price);
                const priceB = parseFloat(b.sale_price || b.price);
                return priceB - priceA;
            });
        }
        // Если sortBy === null, возвращаем без сортировки
        return sorted;
    }, [filteredProducts, sortBy]);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.sale_price || product.price,
            quantity: 1,
            image: product.image,
        });
    };

    const handleTagToggle = (tagId: number) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSortChange = (option: SortOption) => {
        setSortBy(option);
        setSortDropdownOpen(false);
    };

    const handleSortReset = () => {
        setSortBy(null);
        setSortDropdownOpen(false);
    };

    const handleSortClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSortBy(null);
    };

    const handleCarouselScroll = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;
        const scrollAmount = 300;
        const newOffset = direction === 'left'
            ? Math.max(0, carouselOffset - scrollAmount)
            : carouselOffset + scrollAmount;
        setCarouselOffset(newOffset);
    };

    // Если категории загружены, но категория не найдена - редирект на 404
    if (!categoriesLoading && !category) {
        return <Navigate to="/404" replace />;
    }

    const loading = categoriesLoading || productsLoading;

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                <div className="body-container mt-5">
                    <div className="flex gap-6">
                        {/* Левая колонка - Категории */}
                        <CategoriesSidebar selectedCategoryId={category?.id} />

                        {/* Центральная колонка - Основной контент */}
                        <div className="flex-1 space-y-6">
                            {/* Опциональная обложка категории */}
                            {category?.image && (
                                <div
                                    className="category-cover"
                                    style={{ backgroundImage: `url(${category.image})` }}
                                >
                                    <Link to="/" className="category-cover-breadcrumb">
                                        Назад на Главную
                                    </Link>
                                    <h1 className="category-cover-title">{category.name}</h1>
                                </div>
                            )}

                            {/* Блок основного контента */}
                            <div className="block-container">
                                {/* Хлебные крошки (только если нет обложки) */}
                                {!category?.image && (
                                    <>
                                        <nav className="breadcrumbs">
                                            <Link to="/" className="breadcrumb-link">
                                                Назад на Главную
                                            </Link>
                                        </nav>

                                        {/* Заголовок категории */}
                                        <h1 className="category-title">{category?.name || 'Категория'}</h1>
                                    </>
                                )}

                                {/* Фильтры по тегам */}
                                {categoryTags.length > 0 && (
                                    <div className="category-filters">
                                        <div className="tags-container">
                                            {categoryTags.map(tag => {
                                                const isActive = selectedTags.includes(tag.id);
                                                return (
                                                    <button
                                                        key={tag.id}
                                                        className={`tag-filter ${isActive ? 'active' : 'inactive'}`}
                                                        onClick={() => handleTagToggle(tag.id)}
                                                    >
                                                        <span>{tag.name}</span>
                                                        {isActive && (
                                                            <span className="tag-filter-close">
                                                                <Close className="w-[9px] h-[9px]" />
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Разделительная линия (скрыта если есть обложка и нет тегов) */}
                                {!(category?.image && categoryTags.length === 0) && (
                                    <div className="category-divider" />
                                )}

                                {/* Панель сортировки */}
                                <div className="category-toolbar">
                                    <p className="products-count">
                                        Товаров: {loading ? '...' : products.length} шт
                                    </p>

                                    {/* Кнопка сортировки */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className={`sort-button ${sortBy ? 'active' : ''}`}
                                            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                        >
                                            {!sortBy && (
                                                <span className="sort-button-icon">
                                                    <SortLines className="w-4 h-4" />
                                                </span>
                                            )}
                                            <span className="sort-button-text">
                                                {sortBy === 'price_asc' && 'Сначала дешевле'}
                                                {sortBy === 'price_desc' && 'Сначала дороже'}
                                                {!sortBy && 'Сортировать'}
                                            </span>
                                            {sortBy && (
                                                <span className="sort-button-close" onClick={handleSortClose}>
                                                    <Close className="w-[9px] h-[9px]" />
                                                </span>
                                            )}
                                        </button>

                                        {/* Выпадающее меню */}
                                        {sortDropdownOpen && (
                                            <div className="sort-dropdown">
                                                <div
                                                    className="sort-option"
                                                    onClick={() => handleSortChange('price_asc')}
                                                >
                                                    Сначала дешевле
                                                </div>
                                                <div
                                                    className="sort-option"
                                                    onClick={() => handleSortChange('price_desc')}
                                                >
                                                    Сначала дороже
                                                </div>
                                                <div
                                                    className="sort-option-reset"
                                                    onClick={handleSortReset}
                                                >
                                                    Сбросить
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Сетка товаров */}
                                {loading ? (
                                    <div className="products-grid">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
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
                                ) : products.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">
                                            {selectedTags.length > 0
                                                ? 'Нет товаров с выбранными тегами'
                                                : 'В этой категории пока нет товаров'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="products-grid">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onClick={handleProductClick}
                                                onAddToCart={handleAddToCart}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Блок "Ищу подарок" */}
                            {allTags.length > 0 && (
                                <div className="block-container gift-finder">
                                    <h2 className="gift-finder-title">Ищу подарок</h2>

                                    <div className="tags-carousel">
                                        {/* Стрелка влево */}
                                        <button
                                            className={`carousel-arrow carousel-arrow-left ${carouselOffset === 0 ? 'disabled' : ''}`}
                                            onClick={() => handleCarouselScroll('left')}
                                            disabled={carouselOffset === 0}
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        {/* Контейнер карусели */}
                                        <div className="tags-carousel-container" ref={carouselRef}>
                                            <div
                                                className="tags-carousel-track"
                                                style={{ transform: `translateX(-${carouselOffset}px)` }}
                                            >
                                                {allTags.map(tag => (
                                                    <div key={tag.id} className="tag-circle-item">
                                                        <div
                                                            className="tag-circle"
                                                            style={{ backgroundColor: tag.color }}
                                                        />
                                                        <span className="tag-circle-name">{tag.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Стрелка вправо */}
                                        <button
                                            className="carousel-arrow carousel-arrow-right"
                                            onClick={() => handleCarouselScroll('right')}
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Блок "Собрать свой букет" */}
                            <BouquetBuilder />

                            {/* Footer */}
                            <Footer />
                        </div>

                        {/* Правая колонка - Корзина */}
                        <CartSidebar onCheckout={() => {}} />
                    </div>
                </div>
            </main>

            {/* Модальное окно товара */}
            <ProductModal
                isOpen={productModalOpen}
                onClose={() => setProductModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default CategoryPage;


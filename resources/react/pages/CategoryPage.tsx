/**
 * CategoryPage - Страница категории товаров
 *
 * Содержит:
 * - Хлебные крошки
 * - Название категории
 * - Фильтры товаров
 * - Список товаров
 * - Блок "Собрать свой букет"
 */

import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useCategories, useProducts, useCity, useCart } from '@/hooks';
import { Product } from '@/api/types';
import { Header, Footer } from '@/components';
import { CategoriesSidebar, CartSidebar, BouquetBuilder, ProductCard } from '@/components/blocks';
import { ProductModal } from '@/components/modals';

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { categories, loading: categoriesLoading } = useCategories();
    const { selectedCityId } = useCity();
    const { addItem } = useCart();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productModalOpen, setProductModalOpen] = useState(false);

    // Находим категорию по slug
    const category = useMemo(() => {
        return categories.find(c => c.slug === slug);
    }, [categories, slug]);

    // Загружаем товары для этой категории
    const { products, loading: productsLoading } = useProducts({
        city_id: selectedCityId || undefined,
        category_id: category?.id,
    });

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
                    {/* Хлебные крошки */}
                    <nav className="text-sm text-gray-600 mb-4">
                        <Link to="/" className="hover:text-gray-900">Главная</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{category?.name || 'Категория'}</span>
                    </nav>

                    {/* Заголовок категории */}
                    <h1 className="text-4xl font-bold mb-6">{category?.name || 'Категория'}</h1>

                    <div className="flex gap-6">
                        {/* Левая колонка - Категории */}
                        <CategoriesSidebar selectedCategoryId={category?.id} />

                        {/* Центральная колонка - Товары */}
                        <div className="flex-1 space-y-6">
                            {/* Количество товаров */}
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">
                                    Найдено товаров: {loading ? '...' : products.length}
                                </p>
                            </div>

                            {/* Список товаров */}
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
                                    <p className="text-gray-500">В этой категории пока нет товаров</p>
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


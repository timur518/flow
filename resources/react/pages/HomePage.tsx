/**
 * HomePage - Главная страница приложения
 */

import React from 'react';
import { Header, Footer, MobileHeader } from '@/components';
import {
    CategoriesSidebar,
    CartSidebar,
    BouquetBuilder,
    ProductsGrid,
} from '@/components/blocks';
import BannerSlider from '@/components/blocks/BannerSlider';
import { SEOHead } from '@/components/common';
import { useModals } from '@/hooks';
import { Product } from '@/api/types';

const HomePage: React.FC = () => {
    const { openProductModal } = useModals();

    const handleProductClick = (product: Product) => {
        openProductModal(product);
    };

    return (
        <div className="app-container">
            {/* SEO метатеги */}
            <SEOHead />

            {/* Mobile Header */}
            <MobileHeader />

            {/* Header */}
            <Header />

            {/* Основной контент */}
            <main className="main-content">
                <div className="body-container mt-5">
                    <div className="flex gap-6">
                        {/* Левая колонка - Категории */}
                        <CategoriesSidebar />

                        {/* Центральная колонка - Основной контент */}
                        <div className="flex-1 min-w-0 space-y-6">
                            {/* Баннеры */}
                            <BannerSlider />

                            {/* Любимым к 14 февраля (category_id = 2) */}
                            <ProductsGrid
                                title="Любимым к 14 февраля"
                                category_id={2}
                                category_slug="14-fevralia"
                                limit={8}
                                showViewAll={true}
                                onProductClick={handleProductClick}
                            />

                            {/* Акции (товары со скидкой) */}
                            <ProductsGrid
                                title="Акции"
                                on_sale={true}
                                limit={8}
                                showViewAll={false}
                                onProductClick={handleProductClick}
                            />

                            {/* Популярные (случайные 20 товаров) */}
                            <ProductsGrid
                                title="Популярные"
                                random={true}
                                limit={20}
                                showViewAll={false}
                                onProductClick={handleProductClick}
                            />

                            {/* Подарки (случайные 20 товаров) */}
                            <ProductsGrid
                                title="Подарки"
                                category_id={13}
                                limit={20}
                                showViewAll={false}
                                onProductClick={handleProductClick}
                            />

                            {/* Собрать букет */}
                            <BouquetBuilder />

                            {/* Footer внутри центральной колонки */}
                            <Footer />
                        </div>

                        {/* Правая колонка - Корзина */}
                        <CartSidebar />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;

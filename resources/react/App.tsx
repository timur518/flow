/**
 * App - Главный компонент приложения
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, CartProvider, CityProvider, SettingsProvider, CitiesProvider } from '@/contexts';
import { AppLoader } from '@/components';
import HomePage from '@/pages/HomePage';
import CategoryPage from '@/pages/CategoryPage';
import ProductPage from '@/pages/ProductPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AuthProvider>
                    <CitiesProvider>
                        <CityProvider>
                            <CartProvider>
                                <AppLoader>
                                    <Routes>
                                        {/* Главная страница */}
                                        <Route path="/" element={<HomePage />} />

                                        {/* Страница категории */}
                                        <Route path="/category/:slug" element={<CategoryPage />} />

                                        {/* Страница товара */}
                                        <Route path="/:categorySlug/:productId" element={<ProductPage />} />

                                        {/* 404 */}
                                        <Route path="*" element={<NotFoundPage />} />
                                    </Routes>
                                </AppLoader>
                            </CartProvider>
                        </CityProvider>
                    </CitiesProvider>
                </AuthProvider>
            </SettingsProvider>
        </BrowserRouter>
    );
}

export default App;

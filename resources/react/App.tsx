/**
 * App - Главный компонент приложения
 */

import React from 'react';
import { AuthProvider, CartProvider, CityProvider } from '@/contexts';
import { AppLoader } from '@/components';
import HomePage from '@/pages/HomePage';

function App() {
    return (
        <AuthProvider>
            <CityProvider>
                <CartProvider>
                    <AppLoader>
                        <HomePage />
                    </AppLoader>
                </CartProvider>
            </CityProvider>
        </AuthProvider>
    );
}

export default App;

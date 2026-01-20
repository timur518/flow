/**
 * CartSidebar - Боковая панель с корзиной для десктопа
 * Обёртка для CartContent с десктопными стилями
 * Дизайн из Figma: формат 377x646px, закругленные углы 24px
 */

import React from 'react';
import CartContent from './CartContent';
import { useModals } from '@/hooks';

const CartSidebar: React.FC = () => {
    const { openCheckoutModal } = useModals();

    return (
        <aside className="cart-sidebar" role="complementary">
            <div className="block-container cart-sidebar-container">
                <CartContent onCheckout={openCheckoutModal} />
            </div>
        </aside>
    );
};

export default CartSidebar;


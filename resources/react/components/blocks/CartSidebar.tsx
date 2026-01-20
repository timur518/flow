/**
 * CartSidebar - Боковая панель с корзиной для десктопа
 * Обёртка для CartContent с десктопными стилями
 * Дизайн из Figma: формат 377x646px, закругленные углы 24px
 */

import React from 'react';
import CartContent from './CartContent';

interface CartSidebarProps {
    onCheckout?: () => void;
    onClose?: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout, onClose }) => {
    return (
        <aside className="cart-sidebar" role="complementary">
            <div className="block-container cart-sidebar-container">
                <CartContent onCheckout={onCheckout} />
            </div>
        </aside>
    );
};

export default CartSidebar;


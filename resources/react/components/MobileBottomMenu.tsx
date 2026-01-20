/**
 * MobileBottomMenu - Нижнее меню для мобильных устройств
 *
 * Sticky меню внизу экрана с тремя пунктами:
 * - Профиль
 * - Каталог
 * - Корзина (с суммой или надписью "Корзина")
 */

import React from 'react';

interface MobileBottomMenuProps {
    cartItemsCount: number;
    cartTotal: number;
    onProfileClick: () => void;
    onCatalogClick: () => void;
    onCartClick: () => void;
}

const MobileBottomMenu: React.FC<MobileBottomMenuProps> = ({
    cartItemsCount,
    cartTotal,
    onProfileClick,
    onCatalogClick,
    onCartClick,
}) => {
    return (
        <div className="mobile-bottom-menu">
            <div className="mobile-bottom-menu-content">
                {/* Профиль */}
                <button
                    className="mobile-bottom-menu-item"
                    onClick={onProfileClick}
                    aria-label="Профиль"
                >
                    <img
                        src="/images/icons/profile.svg"
                        alt="Профиль"
                        className="mobile-bottom-menu-icon"
                    />
                    <span className="mobile-bottom-menu-label">Профиль</span>
                </button>

                {/* Каталог */}
                <button
                    className="mobile-bottom-menu-item"
                    onClick={onCatalogClick}
                    aria-label="Каталог"
                >
                    <img
                        src="/images/icons/menu.svg"
                        alt="Каталог"
                        className="mobile-bottom-menu-icon"
                    />
                    <span className="mobile-bottom-menu-label">Каталог</span>
                </button>

                {/* Корзина */}
                <button
                    className="mobile-bottom-menu-cart"
                    onClick={onCartClick}
                    aria-label="Корзина"
                >
                    <img
                        src="/images/icons/cartmenu.svg"
                        alt="Корзина"
                        className="mobile-bottom-menu-cart-icon"
                    />
                    <span className="mobile-bottom-menu-cart-label">
                        {cartTotal > 0 ? `${cartTotal.toLocaleString('ru-RU')} ₽` : 'Корзина'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default MobileBottomMenu;


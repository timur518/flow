/**
 * CategoriesSidebar - Боковая панель с категориями для десктопа
 * Обёртка для CategoriesList с десктопными стилями
 * Дизайн из Figma: формат 262x605px, закругленные углы 24px
 */

import React from 'react';
import CategoriesList from './CategoriesList';

interface CategoriesSidebarProps {
    onCategoryClick?: (categoryId: number) => void;
    selectedCategoryId?: number;
}

const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({ onCategoryClick, selectedCategoryId }) => {
    return (
        <div className="categories-sidebar">
            <nav
                className="block-container categories-nav"
                role="navigation"
                aria-label="Категории товаров"
            >
                <CategoriesList
                    onCategoryClick={onCategoryClick}
                    selectedCategoryId={selectedCategoryId}
                />
            </nav>
        </div>
    );
};

export default CategoriesSidebar;


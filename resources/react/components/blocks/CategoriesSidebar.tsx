/**
 * CategoriesSidebar - Боковая панель с категориями
 * Вертикальный список категорий с картинками
 * Дизайн из Figma: формат 262x605px, закругленные углы 24px
 */

import React from 'react';
import { useCategories } from '@/hooks';

interface CategoriesSidebarProps {
    onCategoryClick?: (categoryId: number) => void;
    selectedCategoryId?: number;
}

const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({ onCategoryClick, selectedCategoryId }) => {
    // Категории глобальные, не фильтруются по городу
    const { categories, loading } = useCategories();

    if (loading) {
        return (
            <div className="categories-sidebar">
                <nav className="block-container categories-nav">
                    <ul className="categories-list">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <li key={i} className="category-skeleton">
                                <div className="flex items-center gap-2.5">
                                    <div className="category-skeleton-image" />
                                    <div className="category-skeleton-text" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        );
    }

    return (
        <div className="categories-sidebar">
            <nav
                className="block-container categories-nav"
                role="navigation"
                aria-label="Категории товаров"
            >
                <ul className="categories-list">
                    {categories.map((category) => (
                        <li key={category.id} className="category-item">
                            <button
                                onClick={() => onCategoryClick?.(category.id)}
                                className="category-button"
                                aria-label={category.name}
                                aria-current={selectedCategoryId === category.id ? 'true' : undefined}
                            >
                                {/* Картинка категории - круглая 32x32px */}
                                {category.menu_image ? (
                                    <img
                                        className="category-image"
                                        alt=""
                                        src={category.menu_image}
                                    />
                                ) : (
                                    <span className="category-placeholder">
                                        🌸
                                    </span>
                                )}

                                {/* Название категории - отступ 15px от картинки (32px + 15px = 47px) */}
                                <span className="category-name">
                                    {category.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default CategoriesSidebar;


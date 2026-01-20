/**
 * CategoriesList - Чистый компонент списка категорий
 * Используется как в сайдбаре на десктопе, так и в модальном окне на мобильных
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks';

interface CategoriesListProps {
    onCategoryClick?: (categoryId: number) => void;
    selectedCategoryId?: number;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ onCategoryClick, selectedCategoryId }) => {
    const { categories, loading } = useCategories();

    if (loading) {
        return (
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
        );
    }

    return (
        <ul className="categories-list">
            {categories.map((category) => (
                <li key={category.id} className="category-item">
                    <Link
                        to={`/category/${category.slug}`}
                        className="category-button"
                        aria-label={category.name}
                        aria-current={selectedCategoryId === category.id ? 'true' : undefined}
                        onClick={() => onCategoryClick?.(category.id)}
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

                        {/* Название категории */}
                        <span className="category-name">
                            {category.name}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default CategoriesList;


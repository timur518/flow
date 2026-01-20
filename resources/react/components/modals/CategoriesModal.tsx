/**
 * CategoriesModal - Модальное окно с категориями для мобильных устройств
 * Использует тот же CategoriesList, что и десктопный сайдбар
 */

import React from 'react';
import Modal from './Modal';
import CategoriesList from '../blocks/CategoriesList';

interface CategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryClick?: (categoryId: number) => void;
    selectedCategoryId?: number;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({
    isOpen,
    onClose,
    onCategoryClick,
    selectedCategoryId
}) => {
    const handleCategoryClick = (categoryId: number) => {
        onCategoryClick?.(categoryId);
        onClose(); // Закрываем модалку после выбора категории
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            mobileSlideUp={true}
            size="sm"
        >
            <div className="profile-modal-container hide-scrollbar">
                {/* Шапка: Заголовок и крестик */}
                <div className="profile-modal-header profile-modal-header-profile">
                    <h2 className="profile-modal-title">Категории</h2>
                    <button onClick={onClose} className="profile-modal-close btn-circle-35 bg-white">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Список категорий */}
                <nav
                    className="categories-modal-nav"
                    role="navigation"
                    aria-label="Категории товаров"
                >
                    <CategoriesList
                        onCategoryClick={handleCategoryClick}
                        selectedCategoryId={selectedCategoryId}
                    />
                </nav>
            </div>
        </Modal>
    );
};

export default CategoriesModal;


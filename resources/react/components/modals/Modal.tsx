/**
 * Modal - Базовый компонент модального окна
 *
 * Используется как основа для всех popup окон
 */

import React, { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    height?: number; // Динамическая высота в пикселях
    mobileSlideUp?: boolean; // Анимация выезда снизу на мобильных
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    height,
    mobileSlideUp = false,
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Управление анимацией и рендерингом
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Небольшая задержка для запуска анимации появления
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            // Ждем окончания анимации перед удалением из DOM
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Закрытие по Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl',
    };

    return (
        <div className={`modal fixed inset-0 z-50 flex ${mobileSlideUp ? 'items-end md:items-center' : 'items-center'} justify-center ${mobileSlideUp ? 'p-0 md:p-4' : 'p-4'} ${isAnimating ? 'modal-open' : 'modal-closing'}`}>
            {/* Overlay */}
            <div
                className={`modal-overlay ${isAnimating ? 'modal-overlay-open' : 'modal-overlay-closing'}`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`modal-container ${mobileSlideUp ? 'mobile-slide-up' : ''} ${sizeClasses[size]} ${isAnimating ? 'modal-container-open' : 'modal-container-closing'}`}
                style={height ? { height: `${height}px`, maxHeight: `${height}px` } : undefined}
            >
                {/* Header */}
                {title && (
                    <div className="modal-header">
                        <h2 className="modal-title">{title}</h2>
                        <button
                            onClick={onClose}
                            className="modal-close-button"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;


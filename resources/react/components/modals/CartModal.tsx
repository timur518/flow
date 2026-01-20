/**
 * CartModal - Модальное окно с корзиной для мобильных устройств
 * Использует тот же CartContent, что и десктопный сайдбар
 */

import React from 'react';
import Modal from './Modal';
import CartContent from '../blocks/CartContent';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
    const handleCheckout = () => {
        onCheckout?.();
        onClose(); // Закрываем модалку после перехода к оформлению
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
                    <h2 className="profile-modal-title">Корзина</h2>
                    <button onClick={onClose} className="profile-modal-close btn-circle-35 bg-white">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Содержимое корзины */}
                <div className="cart-modal-content">
                    <CartContent onCheckout={handleCheckout} showHeader={false} />
                </div>
            </div>
        </Modal>
    );
};

export default CartModal;


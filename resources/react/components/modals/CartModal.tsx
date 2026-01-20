/**
 * CartModal - Модальное окно с корзиной для мобильных устройств
 * Структура: шапка, скроллируемый список товаров, футер с итого и кнопкой
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useCart, useAuth, useCity, useStores } from '@/hooks';
import { Plus, Minus } from '@/components/icons';
import { yandexMetrikaService } from '@/api/services';
import cartIcon from '/public/images/icons/cart.svg';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
    const { items, removeItem, updateQuantity, total } = useCart();
    const { user } = useAuth();
    const { selectedCityId } = useCity();
    const { stores } = useStores({ city_id: selectedCityId || undefined });
    const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
    const [addingItems, setAddingItems] = useState<Set<number>>(new Set());
    const [previousItemIds, setPreviousItemIds] = useState<Set<number>>(() => {
        return new Set(items.map(item => item.id));
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const currentItemIds = new Set(items.map(item => item.id));
        const newItems = new Set<number>();

        currentItemIds.forEach(id => {
            if (!previousItemIds.has(id)) {
                newItems.add(id);
            }
        });

        if (newItems.size > 0) {
            setAddingItems(prev => new Set([...prev, ...newItems]));
            setTimeout(() => {
                setAddingItems(prev => {
                    const updated = new Set(prev);
                    newItems.forEach(id => updated.delete(id));
                    return updated;
                });
            }, 400);
        }

        setPreviousItemIds(currentItemIds);
    }, [items, isInitialized]);

    const handleCheckout = () => {
        onCheckout?.();
        onClose();
    };

    const handleRemoveItem = (id: number) => {
        const item = items.find(i => i.id === id);
        if (item) {
            yandexMetrikaService.removeFromCart(
                {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    categories: item.category ? [{id: 0, name: item.category, slug: ''}] : [],
                    sale_price: '',
                    image: '',
                    width: 0,
                    height: 0,
                    tags: []
                },
                item.quantity
            );
        }

        setRemovingItems(prev => new Set(prev).add(id));
        setTimeout(() => {
            removeItem(id);
            setRemovingItems(prev => {
                const updated = new Set(prev);
                updated.delete(id);
                return updated;
            });
        }, 300);
    };

    const handleUpdateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(id);
        } else {
            updateQuantity(id, quantity);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            mobileSlideUp={true}
            size="sm"
        >
            <div className="cart-modal-wrapper">
                {/* Шапка: Заголовок и крестик */}
                <div className="cart-modal-header">
                    <h2 className="cart-modal-title">Корзина</h2>
                    <button onClick={onClose} className="btn-circle-35 bg-white">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {items.length === 0 ? (
                    /* Пустая корзина */
                    <div className="cart-modal-empty">
                        <div className="cart-empty-state">
                            <div className="cart-empty-icon">
                                <img src={cartIcon} alt="Корзина" className="w-[66px] h-[60px]" />
                            </div>
                            <p className="cart-empty-text">
                                Выберите нужный букет, а мы с заботой соберем его для вас
                            </p>
                        </div>
                        <button
                            className="cart-empty-button"
                            type="button"
                            onClick={onClose}
                            aria-label="Выбрать букет"
                        >
                            <span className="cart-empty-button-text">Выбрать букет</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Скроллируемый список товаров */}
                        <div className="cart-modal-content">
                            {items.map((item) => {
                                const isRemoving = removingItems.has(item.id);
                                const isAdding = addingItems.has(item.id);

                                return (
                                    <article
                                        key={item.id}
                                        className={`cart-item ${isRemoving ? 'removing' : ''} ${isAdding ? 'adding' : ''}`}
                                    >
                                        <img
                                            className="cart-item-image"
                                            alt={item.name}
                                            src={item.image || '/placeholder-flower.jpg'}
                                        />
                                        <div className="cart-item-content">
                                            <h2 className="cart-item-name">{item.name}</h2>
                                            <div className="cart-item-bottom">
                                                <div className="cart-item-counter">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        aria-label="Уменьшить количество"
                                                        className="cart-item-counter-button"
                                                    >
                                                        <Minus className="w-3 h-3 text-[#fc6c5f]" />
                                                    </button>
                                                    <div className="cart-item-counter-value">{item.quantity}</div>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        aria-label="Увеличить количество"
                                                        className="cart-item-counter-button"
                                                    >
                                                        <Plus className="w-3 h-3 text-[#fc6c5f]" />
                                                    </button>
                                                </div>
                                                <div className="cart-item-price">
                                                    {parseFloat(item.price).toLocaleString('ru-RU')} ₽
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Футер: Итого и кнопка оформления */}
                        <div className="cart-modal-footer">
                            <div className="cart-modal-total">
                                <span className="cart-modal-total-label">Итого:</span>
                                <span className="cart-modal-total-value">{total.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <button onClick={handleCheckout} className="cart-checkout-button">
                                <div className="cart-checkout-button-text">Оформить заказ</div>
                                {!user ? (
                                    <div className="cart-checkout-button-subtext">и зарегистрироваться</div>
                                ) : stores.length > 0 && stores[0].working_hours ? (
                                    <div className="cart-checkout-button-subtext">
                                        Доставляем {stores[0].working_hours.toLowerCase()}
                                    </div>
                                ) : null}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default CartModal;


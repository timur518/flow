/**
 * CartContent - Чистый компонент содержимого корзины
 * Используется как в сайдбаре на десктопе, так и в модальном окне на мобильных
 */

import React, { useState, useEffect } from 'react';
import { useCart, useAuth, useCity, useStores } from '@/hooks';
import { Plus, Minus } from '@/components/icons';
import { yandexMetrikaService } from '@/api/services';
import cartIcon from '/public/images/icons/cart.svg';

interface CartContentProps {
    onCheckout?: () => void;
    showHeader?: boolean;
}

const CartContent: React.FC<CartContentProps> = ({ onCheckout, showHeader = true }) => {
    const { items, removeItem, updateQuantity, total } = useCart();
    const { user } = useAuth();
    const { selectedCityId, isInitialized: cityInitialized } = useCity();
    const { stores, loading: storesLoading } = useStores({ city_id: selectedCityId || undefined });
    const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
    const [addingItems, setAddingItems] = useState<Set<number>>(new Set());
    const [previousItemIds, setPreviousItemIds] = useState<Set<number>>(() => {
        return new Set(items.map(item => item.id));
    });
    const [isInitialized, setIsInitialized] = useState(false);

    // Проверяем, заблокированы ли заказы в магазине выбранного города
    // Пока город или магазины не загружены, не блокируем кнопку
    const isOrdersBlocked = cityInitialized && !storesLoading && stores.length > 0 && stores[0].orders_blocked;

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

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
        <>
            {/* Заголовок */}
            {showHeader && (
                <header className="cart-header">
                    <h1 className="cart-title">
                        Корзина
                    </h1>
                </header>
            )}

            {items.length === 0 ? (
                /* Пустая корзина */
                <>
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
                        aria-label="Выбрать букет"
                    >
                        <span className="cart-empty-button-text">
                            Выбрать букет
                        </span>
                    </button>
                </>
            ) : (
                /* Корзина с товарами */
                <>
                    {/* Список товаров */}
                    <div className="cart-items-list">
                        {items.map((item) => {
                            const isRemoving = removingItems.has(item.id);
                            const isAdding = addingItems.has(item.id);

                            return (
                                <article
                                    key={item.id}
                                    className={`cart-item ${isRemoving ? 'removing' : ''} ${isAdding ? 'adding' : ''}`}
                                >
                                    {/* Изображение */}
                                    <img
                                        className="cart-item-image"
                                        alt={item.name}
                                        src={item.image || '/placeholder-flower.jpg'}
                                    />

                                    {/* Контент справа от изображения */}
                                    <div className="cart-item-content">
                                        {/* Название */}
                                        <h2 className="cart-item-name">
                                            {item.name}
                                        </h2>

                                        {/* Нижняя часть: счетчик и цена */}
                                        <div className="cart-item-bottom">
                                            {/* Счетчик количества */}
                                            <div className="cart-item-counter">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    aria-label="Уменьшить количество"
                                                    className="cart-item-counter-button"
                                                >
                                                    <Minus className="w-3 h-3 text-[#fc6c5f]" />
                                                </button>

                                                <div className="cart-item-counter-value">
                                                    {item.quantity}
                                                </div>

                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    aria-label="Увеличить количество"
                                                    className="cart-item-counter-button"
                                                >
                                                    <Plus className="w-3 h-3 text-[#fc6c5f]" />
                                                </button>
                                            </div>

                                            {/* Цена */}
                                            <div className="cart-item-price">
                                                {parseFloat(item.price).toLocaleString('ru-RU')} ₽
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Итого */}
                    <div className="cart-total">
                        <div className="cart-total-label">
                            Итого:
                        </div>
                        <div className="cart-total-value">
                            {total.toLocaleString('ru-RU')} ₽
                        </div>
                    </div>

                    {/* Кнопка оформления */}
                    <button
                        onClick={isOrdersBlocked ? undefined : onCheckout}
                        className={`cart-checkout-button ${isOrdersBlocked ? 'disabled' : ''}`}
                        disabled={isOrdersBlocked}
                    >
                        <div className="cart-checkout-button-text">
                            {isOrdersBlocked ? 'Временно не принимаем заказы' : 'Оформить заказ'}
                        </div>
                        {!isOrdersBlocked && (
                            !user ? (
                                <div className="cart-checkout-button-subtext">
                                    и зарегистрироваться
                                </div>
                            ) : stores.length > 0 && stores[0].working_hours ? (
                                <div className="cart-checkout-button-subtext">
                                    Доставляем {stores[0].working_hours.toLowerCase()}
                                </div>
                            ) : null
                        )}
                    </button>
                </>
            )}
        </>
    );
};

export default CartContent;


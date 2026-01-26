/**
 * ModalsContext - Глобальный контекст для управления модальными окнами
 *
 * Позволяет открывать/закрывать модальные окна из любого места приложения
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '@/api/types';
import { useAuth, useCart, useCity, useStores } from '@/hooks';
import { orderService, yandexMetrikaService } from '@/api/services';
import {
    AuthModal,
    ProfileModal,
    AddressesModal,
    ProductModal,
    CheckoutModal,
    CategoriesModal,
    CartModal,
} from '@/components/modals';
import { MobileBottomMenu } from '@/components';

interface ModalsContextType {
    // Открытие модальных окон
    openAuthModal: () => void;
    openProfileModal: () => void;
    openProfileModalWithOrder: (orderId: number) => void;
    openAddressesModal: () => void;
    openProductModal: (product: Product) => void;
    openCheckoutModal: () => void;
    openCategoriesModal: () => void;
    openCartModal: () => void;

    // Закрытие модальных окон
    closeAllModals: () => void;
}

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

export const useModals = () => {
    const context = useContext(ModalsContext);
    if (!context) {
        throw new Error('useModals must be used within a ModalsProvider');
    }
    return context;
};

interface ModalsProviderProps {
    children: React.ReactNode;
}

export const ModalsProvider: React.FC<ModalsProviderProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const { items: cartItems, total: cartTotal, clearCart } = useCart();
    const { selectedCityId } = useCity();
    const { stores } = useStores({ city_id: selectedCityId || undefined });

    // Состояния модальных окон
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileInitialOrderId, setProfileInitialOrderId] = useState<number | null>(null);
    const [addressesModalOpen, setAddressesModalOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
    const [cartModalOpen, setCartModalOpen] = useState(false);

    // Функции открытия модальных окон
    const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
    const openProfileModal = useCallback(() => {
        setProfileInitialOrderId(null);
        setProfileModalOpen(true);
    }, []);
    const openProfileModalWithOrder = useCallback((orderId: number) => {
        setProfileInitialOrderId(orderId);
        setProfileModalOpen(true);
    }, []);
    const openAddressesModal = useCallback(() => setAddressesModalOpen(true), []);
    const openProductModal = useCallback((product: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    }, []);
    const openCheckoutModal = useCallback(() => setCheckoutModalOpen(true), []);
    const openCategoriesModal = useCallback(() => setCategoriesModalOpen(true), []);
    const openCartModal = useCallback(() => setCartModalOpen(true), []);

    const closeAllModals = useCallback(() => {
        setAuthModalOpen(false);
        setProfileModalOpen(false);
        setAddressesModalOpen(false);
        setProductModalOpen(false);
        setCheckoutModalOpen(false);
        setCategoriesModalOpen(false);
        setCartModalOpen(false);
    }, []);

    // Обработчики
    const handleLoginClick = () => {
        if (user) {
            setProfileModalOpen(true);
        } else {
            setAuthModalOpen(true);
        }
    };

    const handleMobileCartClick = () => {
        setCartModalOpen(true);
    };

    const handleCheckoutSubmit = async (data: {
        deliveryType: 'delivery' | 'pickup';
        address?: string;
        recipientName: string;
        recipientPhone: string;
        deliveryDate: string;
        deliveryTime: string;
        cardMessage?: string;
        comment?: string;
        paymentType: 'online' | 'on_delivery';
        isAnonymous: boolean;
        latitude?: number | null;
        longitude?: number | null;
        promoCode?: string;
        cityId?: number | null;
    }) => {
        try {
            if (!user) {
                alert('Пожалуйста, авторизуйтесь для оформления заказа');
                setCheckoutModalOpen(false);
                setAuthModalOpen(true);
                return;
            }

            if (stores.length === 0) {
                alert('Магазин в выбранном городе не найден');
                return;
            }

            const orderData = {
                store_id: stores[0].id,
                city_id: data.cityId || selectedCityId,
                delivery_type: data.deliveryType,
                delivery_address: data.deliveryType === 'delivery' ? data.address : undefined,
                delivery_latitude: data.deliveryType === 'delivery' && data.latitude ? data.latitude.toString() : undefined,
                delivery_longitude: data.deliveryType === 'delivery' && data.longitude ? data.longitude.toString() : undefined,
                recipient_name: data.recipientName,
                recipient_phone: data.recipientPhone,
                delivery_date: data.deliveryDate,
                delivery_time: data.deliveryTime,
                card_text: data.cardMessage || undefined,
                comment: data.comment || undefined,
                payment_type: data.paymentType,
                is_anonymous: data.isAnonymous,
                promo_code: data.promoCode || undefined,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                })),
            };

            const response = await orderService.createOrder(orderData);

            const validCartItems = cartItems.filter(item => item && item.id);
            if (validCartItems.length > 0) {
                const totalPrice = validCartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
                yandexMetrikaService.purchase(
                    response.order.order_number,
                    validCartItems.map(item => ({
                        product: {
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            categories: item.category ? [{ id: 0, name: item.category, slug: '' }] : [],
                            sale_price: '',
                            image: '',
                            width: 0,
                            height: 0,
                            tags: []
                        },
                        quantity: item.quantity,
                        category: item.category
                    })),
                    totalPrice
                );
            }

            clearCart();
            setCheckoutModalOpen(false);

            // Открываем профиль с детальной информацией о созданном заказе
            if (response.payment_url) {
                // Если есть ссылка на оплату — переходим на неё
                window.location.href = response.payment_url;
            } else {
                // Иначе показываем детали заказа в профиле
                setProfileInitialOrderId(response.order.id);
                setProfileModalOpen(true);
            }
        } catch (error: any) {
            console.error('Ошибка при создании заказа:', error);
            alert(error.message || 'Произошла ошибка при оформлении заказа');
        }
    };

    const contextValue: ModalsContextType = {
        openAuthModal,
        openProfileModal,
        openProfileModalWithOrder,
        openAddressesModal,
        openProductModal,
        openCheckoutModal,
        openCategoriesModal,
        openCartModal,
        closeAllModals,
    };

    return (
        <ModalsContext.Provider value={contextValue}>
            {children}

            {/* Модальные окна */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />

            <ProfileModal
                isOpen={profileModalOpen}
                onClose={() => {
                    setProfileModalOpen(false);
                    setProfileInitialOrderId(null);
                }}
                initialOrderId={profileInitialOrderId}
            />

            <AddressesModal
                isOpen={addressesModalOpen}
                onClose={() => setAddressesModalOpen(false)}
            />

            <ProductModal
                isOpen={productModalOpen}
                onClose={() => setProductModalOpen(false)}
                product={selectedProduct}
            />

            <CheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                items={cartItems}
                onSubmit={handleCheckoutSubmit}
            />

            <CategoriesModal
                isOpen={categoriesModalOpen}
                onClose={() => setCategoriesModalOpen(false)}
            />

            <CartModal
                isOpen={cartModalOpen}
                onClose={() => setCartModalOpen(false)}
                onCheckout={() => {
                    setCartModalOpen(false);
                    setCheckoutModalOpen(true);
                }}
            />

            {/* Мобильное нижнее меню */}
            <MobileBottomMenu
                onProfileClick={handleLoginClick}
                onCatalogClick={() => setCategoriesModalOpen(true)}
                onCartClick={handleMobileCartClick}
                cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                cartTotal={cartTotal}
            />
        </ModalsContext.Provider>
    );
};

export default ModalsContext;


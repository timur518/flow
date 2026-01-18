/**
 * HomePage - Главная страница приложения
 */

import React, { useState, useEffect } from 'react';
import {
    Header,
    Footer,
} from '@/components';
import {
    CategoriesSidebar,
    CartSidebar,
    BouquetBuilder,
    ProductsGrid,
} from '@/components/blocks';
import BannerSlider from '@/components/blocks/BannerSlider';
import {
    AuthModal,
    ProfileModal,
    AddressesModal,
    ProductModal,
    CheckoutModal,
} from '@/components/modals';
import { SEOHead } from '@/components/common';
import { useAuth, useCart, useCity, useStores } from '@/hooks';
import { Product, Address } from '@/api/types';
import { orderService, yandexMetrikaService } from '@/api/services';

interface HomePageProps {
    initialProduct?: Product | null;
    initialModalOpen?: boolean;
    onModalClose?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
    initialProduct = null,
    initialModalOpen = false,
    onModalClose
}) => {
    const { user } = useAuth();
    const { items: cartItems, addItem, clearCart } = useCart();
    const { selectedCityId } = useCity();
    const { stores } = useStores({ city_id: selectedCityId || undefined });

    // Модальные окна
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [ordersListModalOpen, setOrdersListModalOpen] = useState(false);
    const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [addressesModalOpen, setAddressesModalOpen] = useState(false);
    const [addressFormModalOpen, setAddressFormModalOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [productModalOpen, setProductModalOpen] = useState(initialModalOpen);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

    // Обновляем состояние при изменении props
    useEffect(() => {
        if (initialProduct) {
            setSelectedProduct(initialProduct);
        }
        if (initialModalOpen) {
            setProductModalOpen(true);
        }
    }, [initialProduct, initialModalOpen]);

    // Обработчики для Header
    const handleLoginClick = () => {
        if (user) {
            setProfileModalOpen(true);
        } else {
            setAuthModalOpen(true);
        }
    };

    const handleCartClick = () => {
        if (cartItems.length > 0) {
            setCheckoutModalOpen(true);
        }
    };

    // Обработчики для профиля
    const handleEditProfile = () => {
        setProfileModalOpen(false);
        setEditProfileModalOpen(true);
    };

    const handleViewOrders = () => {
        setProfileModalOpen(false);
        setOrdersListModalOpen(true);
    };

    const handleViewAddresses = () => {
        setProfileModalOpen(false);
        setAddressesModalOpen(true);
    };

    const handleViewOrder = (orderId: number) => {
        setSelectedOrderId(orderId);
        setProfileModalOpen(false);
        setOrdersListModalOpen(false);
        setOrderDetailModalOpen(true);
    };

    // Обработчики для адресов
    const handleAddAddress = () => {
        setSelectedAddress(null);
        setAddressFormModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setSelectedAddress(address);
        setAddressFormModalOpen(true);
    };

    const handleAddressFormSuccess = () => {
        setAddressFormModalOpen(false);
        // Можно обновить список адресов
    };

    // Обработчики для товаров
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const handleProductModalClose = () => {
        setProductModalOpen(false);
        // Если передан обработчик закрытия (из ProductPage), вызываем его
        if (onModalClose) {
            onModalClose();
        }
    };

    const handleAddToCart = (product: Product, quantity: number) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.sale_price || product.price,
            quantity,
            image: product.image,
        });
    };

    // Обработчик оформления заказа
    const handleCheckoutSubmit = async (orderData: any) => {
        try {
            // Проверяем наличие необходимых данных
            if (!selectedCityId) {
                alert('Пожалуйста, выберите город');
                return;
            }

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

            // Формируем данные для API
            const createOrderData = {
                city_id: selectedCityId,
                store_id: stores[0].id,
                payment_type: 'on_delivery' as const, // Пока только оплата при получении, т.к. YooKassa не интегрирована
                delivery_type: orderData.delivery_mode === 'delivery' ? 'delivery' as const : 'pickup' as const,
                delivery_date: orderData.recipient.delivery_date,
                delivery_time: orderData.recipient.delivery_time,
                delivery_address: orderData.delivery_mode === 'delivery' ? orderData.recipient.address : undefined,
                delivery_latitude: orderData.delivery_mode === 'delivery' ? orderData.recipient.latitude?.toString() : undefined,
                delivery_longitude: orderData.delivery_mode === 'delivery' ? orderData.recipient.longitude?.toString() : undefined,
                recipient_name: orderData.recipient.name || '',
                recipient_phone: orderData.recipient.phone || '',
                recipient_social: orderData.recipient.social_link || undefined,
                comment: orderData.comment || undefined,
                promo_code: orderData.promo_code || undefined,
                is_anonymous: orderData.is_anonymous || false,
                items: orderData.items.map((item: any) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                })),
            };

            console.log('Отправка заказа:', createOrderData);

            // Отправляем заказ на сервер
            const response = await orderService.createOrder(createOrderData);

            console.log('Заказ создан:', response);

            // Отправка события "Успешное оформление заказа" в Яндекс Метрику
            yandexMetrikaService.purchase(
                response.order.order_number,
                orderData.items.map((item: any) => ({
                    product: {
                        id: item.id,
                        name: item.name,
                        price: item.price.toString(),
                        sale_price: null,
                        image: item.image,
                    },
                    quantity: item.quantity,
                })),
                parseFloat(response.order.total)
            );

            // Очищаем корзину
            clearCart();

            // Закрываем модальное окно
            setCheckoutModalOpen(false);

            // Показываем сообщение об успехе
            alert(`Заказ №${response.order.order_number} успешно оформлен!\n\nСтатус: ${response.order.status}\nОплата: ${response.order.payment_type === 'on_delivery' ? 'При получении' : 'Онлайн'}`);

            // Если есть URL для оплаты (когда будет интеграция с YooKassa)
            if (response.payment_url) {
                window.location.href = response.payment_url;
            }

        } catch (error: any) {
            console.error('Ошибка при оформлении заказа:', error);

            // Показываем понятное сообщение об ошибке
            const errorMessage = error.response?.data?.message || error.message || 'Произошла ошибка при оформлении заказа';
            alert(`Ошибка: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* SEO метатеги */}
            <SEOHead />

            {/* Header на всю ширину */}
            <Header
                onLoginClick={handleLoginClick}
                onCartClick={handleCartClick}
                cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            />

            {/* Основной контент */}
            <main className="main-content">
                <div className="body-container mt-5">
                    <div className="flex gap-6">
                        {/* Левая колонка - Категории */}
                        <CategoriesSidebar />

                        {/* Центральная колонка - Основной контент */}
                        <div className="flex-1 space-y-6">
                            {/* Баннеры */}
                            <BannerSlider />

                            {/* Сетка товаров */}
                            <ProductsGrid onProductClick={handleProductClick} />

                            {/* Собрать букет */}
                            <BouquetBuilder />

                            {/* Footer внутри центральной колонки */}
                            <Footer />
                        </div>

                        {/* Правая колонка - Корзина */}
                        <CartSidebar onCheckout={() => setCheckoutModalOpen(true)} />
                    </div>
                </div>
            </main>

            {/* Модальное окно авторизации */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />

            {/* Модальные окна профиля */}
            <ProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />

            {/* Модальные окна адресов */}
            <AddressesModal
                isOpen={addressesModalOpen}
                onClose={() => setAddressesModalOpen(false)}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
            />

            {/* Модальное окно товара */}
            <ProductModal
                isOpen={productModalOpen}
                onClose={handleProductModalClose}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
            />

            {/* Модальное окно оформления заказа */}
            <CheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                items={cartItems}
                onSubmit={handleCheckoutSubmit}
            />
        </div>
    );
};

export default HomePage;

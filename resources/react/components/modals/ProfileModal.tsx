/**
 * ProfileModal - Модальное окно профиля пользователя
 * С динамической загрузкой подразделов
 */

import React, { useState, lazy, Suspense, useEffect } from 'react';
import Modal from './Modal';
import { useAuth, useOrders, useAddresses } from '@/hooks';
import { Telegram, WhatsApp } from '@/components/icons';
import { ProfileSectionSkeleton } from './profile-sections';

// Ленивая загрузка подразделов
const EditProfile = lazy(() => import('./profile-sections/EditProfile'));
const OrdersHistory = lazy(() => import('./profile-sections/OrdersHistory'));
const OrderDetail = lazy(() => import('./profile-sections/OrderDetail'));
const AddAddress = lazy(() => import('./profile-sections/AddAddress'));
const EditAddress = lazy(() => import('./profile-sections/EditAddress'));

type ProfileSection = 'main' | 'edit-profile' | 'orders-history' | 'order-detail' | 'add-address' | 'edit-address';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, logout, getProfile, loading: authLoading } = useAuth();
    const { orders, refetch: refetchOrders, loading: ordersLoading } = useOrders();
    const { addresses, refetch: refetchAddresses, loading: addressesLoading } = useAddresses();

    // Состояние для управления подразделами
    const [currentSection, setCurrentSection] = useState<ProfileSection>('main');
    const [animationDirection, setAnimationDirection] = useState<'forward' | 'back' | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    // Функция для перевода статуса заказа
    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            new: 'Новый',
            processing: 'В обработке',
            assembling: 'Собирается',
            awaiting_delivery: 'Ожидает доставку',
            delivering: 'Доставляется',
            completed: 'Завершен',
            cancelled: 'Отменен',
        };
        return statusMap[status] || status;
    };

    // Обновление данных при открытии модального окна
    useEffect(() => {
        if (isOpen && !hasLoadedOnce) {
            const refreshData = async () => {
                setIsRefreshing(true);
                try {
                    // Параллельно загружаем все данные
                    await Promise.all([
                        getProfile(),
                        refetchOrders(),
                        refetchAddresses(),
                    ]);
                    setHasLoadedOnce(true);
                } catch (error) {
                    console.error('Ошибка обновления данных профиля:', error);
                } finally {
                    setIsRefreshing(false);
                }
            };

            refreshData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Предзагрузка компонентов при открытии модального окна
    useEffect(() => {
        if (isOpen) {
            // Предзагружаем компоненты в фоне
            import('./profile-sections/EditProfile');
            import('./profile-sections/OrdersHistory');
            import('./profile-sections/OrderDetail');
            import('./profile-sections/AddAddress');
            import('./profile-sections/EditAddress');
        }
    }, [isOpen]);

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    // Навигация между подразделами
    const navigateToSection = (section: ProfileSection, orderId?: number, addressId?: number) => {
        setAnimationDirection('forward');
        if (orderId) {
            setSelectedOrderId(orderId);
        }
        if (addressId) {
            setSelectedAddressId(addressId);
        }
        setCurrentSection(section);

        // Сбрасываем анимацию после её завершения (350ms анимация)
        setTimeout(() => {
            setAnimationDirection(null);
        }, 350);
    };

    const navigateBack = async () => {
        setAnimationDirection('back');
        setCurrentSection('main');
        setSelectedOrderId(null);
        setSelectedAddressId(null);

        // Обновляем данные профиля при возврате
        setIsRefreshing(true);
        try {
            await Promise.all([
                getProfile(),
                refetchOrders(),
                refetchAddresses(),
            ]);
        } catch (error) {
            console.error('Ошибка обновления данных профиля:', error);
        } finally {
            setIsRefreshing(false);
        }

        // Сбрасываем анимацию после её завершения (350ms анимация)
        setTimeout(() => {
            setAnimationDirection(null);
        }, 350);
    };

    // Сброс состояния при закрытии модалки
    const handleClose = () => {
        setCurrentSection('main');
        setAnimationDirection(null);
        setSelectedOrderId(null);
        setSelectedAddressId(null);
        setHasLoadedOnce(false);
        onClose();
    };

    // Получаем последний активный заказ
    const lastActiveOrder = orders.find(order =>
        ['new', 'processing', 'assembling', 'awaiting_delivery', 'delivering'].includes(order.status)
    ) || orders[0];

    // Получаем первое изображение из последнего заказа
    const lastOrderImage = lastActiveOrder?.items?.[0]?.product?.images?.[0]?.url;

    // Определяем класс анимации
    const getAnimationClass = () => {
        if (!animationDirection) return '';
        return animationDirection === 'forward' ? 'slide-left' : 'slide-right';
    };

    // Показываем скелетон только во время обновления данных
    const isLoading = isRefreshing;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="sm">
            <div className={`profile-modal-wrapper ${getAnimationClass()}`}>
                {/* Основной экран профиля */}
                {currentSection === 'main' && (
                    <>
                        {isLoading ? (
                            <ProfileSectionSkeleton />
                        ) : (
                            <div key="main" className="profile-modal-container hide-scrollbar">
                                {/* 1. Шапка: Имя и крестик */}
                                <div className="profile-modal-header profile-modal-header-profile">
                                    <h2 className="profile-modal-title">{user?.name || 'Пользователь'}</h2>
                                    <button onClick={handleClose} className="profile-modal-close btn-circle-35 bg-white">
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                            <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* 2. Телефон и редактирование */}
                                <div className="profile-modal-phone-section">
                                    <div className="profile-modal-phone">{user?.phone || 'Не указан'}</div>
                                    <button
                                        onClick={() => navigateToSection('edit-profile')}
                                        className="profile-modal-edit-link"
                                    >
                                        Редактировать профиль
                                    </button>
                                </div>

                        {/* 3. История заказов */}
                        <div className="profile-modal-section">
                            <div className="profile-modal-orders-wrapper white-block">
                                <h3 className="profile-modal-section-title">История заказов</h3>

                                <div className="profile-modal-orders">
                                    {/* Последний активный заказ */}
                                    {lastActiveOrder && (
                                        <button
                                            onClick={() => navigateToSection('order-detail', lastActiveOrder.id)}
                                            className="profile-modal-order-card"
                                        >
                                            {lastOrderImage && (
                                                <img
                                                    src={lastOrderImage}
                                                    alt="Заказ"
                                                    className="profile-modal-order-image"
                                                />
                                            )}
                                            <div className="profile-modal-order-info">
                                                <div className="profile-modal-order-number">
                                                    Заказ №{lastActiveOrder.order_number}
                                                </div>
                                                <div className="profile-modal-order-status">
                                                    {getStatusText(lastActiveOrder.status)}
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    {/* Все заказы */}
                                    <button
                                        onClick={() => navigateToSection('orders-history')}
                                        className="profile-modal-all-orders"
                                    >
                                        <span className="profile-modal-all-orders-text">Все заказы</span>
                                        <div className="profile-modal-all-orders-arrow">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M4 2L8 6L4 10" stroke="#737373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Мои адреса */}
                        <div className="profile-modal-section">
                            <div className="profile-modal-addresses-wrapper white-block">
                                <h3 className="profile-modal-section-title">Мои адреса</h3>

                                {addresses.length > 0 ? (
                                    <div className="profile-modal-addresses">
                                        {[...addresses]
                                            .sort((a, b) => {
                                                // Адрес по умолчанию всегда первый
                                                if (a.is_default && !b.is_default) return -1;
                                                if (!a.is_default && b.is_default) return 1;
                                                // Остальные сортируем от новых к старым
                                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                            })
                                            .map(address => (
                                            <button
                                                key={address.id}
                                                onClick={() => navigateToSection('edit-address', undefined, address.id)}
                                                className="profile-modal-address-card"
                                            >
                                                <div className="profile-modal-address-text">
                                                    {address.address}
                                                    {address.apartment && `, кв. ${address.apartment}`}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile-modal-addresses-empty">
                                        У вас пока нет сохраненных адресов
                                    </div>
                                )}

                                <button
                                    onClick={() => navigateToSection('add-address')}
                                    className="profile-modal-add-address btn-primary"
                                >
                                    Добавить адрес
                                </button>
                            </div>
                        </div>

                        {/* 5. Служба поддержки */}
                        <div className="profile-modal-section">
                            <div className="profile-modal-support-wrapper white-block">
                                <h3 className="profile-modal-section-title">Служба поддержки</h3>

                                <div className="profile-modal-support">
                                    <a href="#" className="profile-modal-support-item">
                                        <div className="profile-modal-support-icon profile-modal-support-icon-telegram">
                                            <Telegram />
                                        </div>
                                        <span className="profile-modal-support-text">Написать в Telegram</span>
                                    </a>

                                    <a href="#" className="profile-modal-support-item">
                                        <div className="profile-modal-support-icon profile-modal-support-icon-whatsapp">
                                            <WhatsApp />
                                        </div>
                                        <span className="profile-modal-support-text">Написать в WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 6. Юридическая информация */}
                        <div className="profile-modal-section">
                            <div className="profile-modal-legal-wrapper white-block">
                                <h3 className="profile-modal-section-title">Юридическая информация</h3>

                                <div className="profile-modal-legal">
                                    <a href="#" className="profile-modal-legal-link">Политика конфиденциальности</a>
                                    <a href="#" className="profile-modal-legal-link">Политика обработки перс данных</a>
                                    <a href="#" className="profile-modal-legal-link">Политика обработки cookies</a>
                                    <a href="#" className="profile-modal-legal-link">Публичная оферта</a>
                                </div>
                            </div>
                        </div>

                                {/* 7. Выход */}
                                <button onClick={handleLogout} className="profile-modal-logout">
                                    Выйти
                                </button>
                            </div>
                        )}
                    </>
                )}


                {/* Динамические подразделы с ленивой загрузкой */}
                {currentSection === 'edit-profile' && (
                    <Suspense fallback={<div key="skeleton-edit"><ProfileSectionSkeleton /></div>}>
                        <div key="edit-profile">
                            <EditProfile onBack={navigateBack} />
                        </div>
                    </Suspense>
                )}

                {currentSection === 'orders-history' && (
                    <Suspense fallback={<div key="skeleton-orders"><ProfileSectionSkeleton /></div>}>
                        <div key="orders-history">
                            <OrdersHistory
                                onBack={navigateBack}
                                onViewOrder={(orderId) => navigateToSection('order-detail', orderId)}
                            />
                        </div>
                    </Suspense>
                )}

                {currentSection === 'order-detail' && selectedOrderId && (
                    <Suspense fallback={<div key="skeleton-detail"><ProfileSectionSkeleton /></div>}>
                        <div key={`order-detail-${selectedOrderId}`}>
                            <OrderDetail
                                orderId={selectedOrderId}
                                onBack={navigateBack}
                            />
                        </div>
                    </Suspense>
                )}

                {currentSection === 'add-address' && (
                    <Suspense fallback={<div key="skeleton-address"><ProfileSectionSkeleton /></div>}>
                        <div key="add-address">
                            <AddAddress onBack={navigateBack} />
                        </div>
                    </Suspense>
                )}

                {currentSection === 'edit-address' && selectedAddressId && (
                    <Suspense fallback={<div key="skeleton-edit-address"><ProfileSectionSkeleton /></div>}>
                        <div key={`edit-address-${selectedAddressId}`}>
                            <EditAddress
                                addressId={selectedAddressId}
                                onBack={navigateBack}
                            />
                        </div>
                    </Suspense>
                )}
            </div>
        </Modal>
    );
};

export default ProfileModal;


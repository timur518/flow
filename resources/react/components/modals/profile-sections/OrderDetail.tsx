/**
 * OrderDetail - Подраздел просмотра деталей заказа
 * Используется внутри ProfileModal
 */

import React from 'react';
import { useOrder } from '@/hooks';
import { Order } from '@/api/types';
import { Telegram, WhatsApp } from '@/components/icons';
import ProfileSectionSkeleton from './ProfileSectionSkeleton';
import inprocessIcon from '/public/images/icons/inprocess.svg';
import completedIcon from '/public/images/icons/completed.svg';
import cancelledIcon from '/public/images/icons/cancelled.svg';

interface OrderDetailProps {
    orderId: number;
    onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onBack }) => {
    const { order, loading, error } = useOrder(orderId);

    // Показываем скелетон во время загрузки
    if (loading) {
        return <ProfileSectionSkeleton />;
    }

    const getStatusText = (status: Order['status']) => {
        const statusMap = {
            new: 'В процессе',
            processing: 'В процессе',
            assembling: 'В процессе',
            awaiting_delivery: 'В процессе',
            delivering: 'В процессе',
            completed: 'Завершен',
            cancelled: 'Отменен',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: Order['status']) => {
        const colorMap = {
            new: '#FDAFC0',
            processing: '#FDAFC0',
            assembling: '#FDAFC0',
            awaiting_delivery: '#FDAFC0',
            delivering: '#FDAFC0',
            completed: '#75AC7D',
            cancelled: '#737373',
        };
        return colorMap[status] || '#737373';
    };

    const getStatusIcon = (status: Order['status']) => {
        if (status === 'completed') {
            return completedIcon;
        } else if (status === 'cancelled') {
            return cancelledIcon;
        } else {
            return inprocessIcon;
        }
    };

    const isInProgress = (status: Order['status']) => {
        return ['new', 'processing', 'assembling', 'awaiting_delivery', 'delivering'].includes(status);
    };

    const getDeliveryTypeText = (deliveryType: Order['delivery_type']) => {
        return deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз';
    };

    const formatDeliveryDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="profile-section-container hide-scrollbar">
            {/* Шапка с кнопкой назад */}
            <div className="profile-modal-header">
                <button onClick={onBack} className="profile-modal-back btn-circle-35 bg-white">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M7 1L1 7L7 13" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h2 className="profile-modal-title">
                    {order ? `Заказ №${order.order_number}` : 'Заказ'}
                </h2>
                <div style={{ width: '35px' }}></div>
            </div>

            {/* Контент */}
            <div className="profile-section-content">
                {error && (
                    <div className="profile-section-error error-message">
                        {error}
                    </div>
                )}

                {order ? (
                    <div className="order-detail-content">
                        {/* Кружочек статуса */}
                        <div className="order-detail-status-badge-wrapper">
                            <div
                                className="order-detail-status-badge"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                                <img
                                    src={getStatusIcon(order.status)}
                                    alt={getStatusText(order.status)}
                                    style={{ maxWidth: '10px', height: 'auto' }}
                                />
                            </div>
                        </div>

                        {/* Статус заказа */}
                        <div className="order-detail-status-text">
                            {getStatusText(order.status)}
                        </div>

                        {/* Информация о доставке (только если в процессе) */}
                        {isInProgress(order.status) && (
                            <div className="order-detail-delivery-info">
                                Будет доставлен {formatDeliveryDate(order.delivery_date)}
                                {order.delivery_time && (
                                    <>
                                        <br />в {order.delivery_time}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Информация о заказе */}
                        <div className="order-detail-section white-block">
                            <h3 className="order-detail-section-title">Информация о заказе</h3>
                            <div className="order-detail-info-list">
                                <div className="order-detail-info-row">
                                    <label className="order-detail-info-label">Тип доставки</label>
                                    <div className="order-detail-info-value">{getDeliveryTypeText(order.delivery_type)}</div>
                                </div>
                                <div className="order-detail-info-row">
                                    <label className="order-detail-info-label">Получатель</label>
                                    <div className="order-detail-info-value">{order.recipient_name}</div>
                                </div>
                                <div className="order-detail-info-row">
                                    <label className="order-detail-info-label">Телефон получателя</label>
                                    <div className="order-detail-info-value">{order.recipient_phone}</div>
                                </div>
                                {order.delivery_address && (
                                    <div className="order-detail-info-row">
                                        <label className="order-detail-info-label">Адрес доставки</label>
                                        <div className="order-detail-info-value">{order.delivery_address}</div>
                                    </div>
                                )}
                                <div className="order-detail-info-row">
                                    <label className="order-detail-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={order.is_anonymous}
                                            disabled
                                            className="order-detail-checkbox"
                                        />
                                        <span className="order-detail-checkbox-text">Анонимный заказ</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Содержимое заказа */}
                        <div className="order-detail-section white-block">
                            <h3 className="order-detail-section-title">Содержимое заказа</h3>
                            <div className="order-detail-items">
                                {order.items.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <div className="order-detail-item">
                                            {item.product?.images?.[0] && (
                                                <img
                                                    src={item.product.images[0].url}
                                                    alt={item.product_name}
                                                    className="order-detail-item-image"
                                                />
                                            )}
                                            <div className="order-detail-item-info">
                                                <div className="order-detail-item-name">{item.product_name}</div>
                                                <div className="order-detail-item-quantity">
                                                    {item.quantity} шт
                                                </div>
                                            </div>
                                            <div className="order-detail-item-price">
                                                {parseFloat(item.total).toLocaleString('ru-RU')} р
                                            </div>
                                        </div>
                                        {index < order.items.length - 1 && (
                                            <div className="order-detail-item-divider" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Итого */}
                            <div className="order-detail-totals">
                                <div className="order-detail-total-row">
                                    <span>Доставка:</span>
                                    <span>{parseFloat(order.delivery_cost).toLocaleString('ru-RU')} р</span>
                                </div>
                                {parseFloat(order.discount) > 0 && (
                                    <div className="order-detail-total-row">
                                        <span>Скидка:</span>
                                        <span>{parseFloat(order.discount).toLocaleString('ru-RU')} р</span>
                                    </div>
                                )}
                                <div className="order-detail-total-row order-detail-total-final">
                                    <span>Итого:</span>
                                    <span>{parseFloat(order.total).toLocaleString('ru-RU')} р</span>
                                </div>
                            </div>
                        </div>

                        {/* Вопросы по заказу */}
                        <div className="order-detail-support">
                            <h3 className="order-detail-support-title">Вопросы по заказу</h3>
                            <div className="order-detail-support-buttons">
                                <a href="#" className="order-detail-support-button">
                                    <div className="order-detail-support-icon">
                                        <WhatsApp />
                                    </div>
                                </a>
                                <a href="#" className="order-detail-support-button">
                                    <div className="order-detail-support-icon">
                                        <Telegram />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="profile-section-empty">
                        <p className="profile-section-empty-text">Заказ не найден</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;


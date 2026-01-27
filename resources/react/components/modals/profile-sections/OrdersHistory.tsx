/**
 * OrdersHistory - Подраздел истории заказов
 * Используется внутри ProfileModal
 */

import React from 'react';
import { useOrders } from '@/hooks';
import { Order } from '@/api/types';
import ProfileSectionSkeleton from './ProfileSectionSkeleton';
import inprocessIcon from '/public/images/icons/inprocess.svg';
import completedIcon from '/public/images/icons/completed.svg';
import cancelledIcon from '/public/images/icons/cancelled.svg';

interface OrdersHistoryProps {
    onBack: () => void;
    onViewOrder: (orderId: number) => void;
}

interface GroupedOrders {
    [key: string]: Order[];
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ onBack, onViewOrder }) => {
    const { orders, loading, error } = useOrders();

    // Показываем скелетон во время загрузки
    if (loading) {
        return <ProfileSectionSkeleton />;
    }

    const getStatusText = (status: Order['status']) => {
        const statusMap = {
            new: 'На подтверждении',
            processing: 'В обработке',
            assembling: 'Собирается',
            awaiting_delivery: 'Ожидает доставку',
            delivering: 'Доставляется',
            completed: 'Завершен',
            cancelled: 'Отменен',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: Order['status']) => {
        const colorMap = {
            new: '#87CEEB',
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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const getMonthYear = (dateString: string) => {
        const date = new Date(dateString);
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Группируем заказы по месяцам
    const groupOrdersByMonth = (orders: Order[]): GroupedOrders => {
        return orders.reduce((groups: GroupedOrders, order) => {
            const monthYear = getMonthYear(order.created_at);
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(order);
            return groups;
        }, {});
    };

    const groupedOrders = groupOrdersByMonth(orders);
    const sortedMonths = Object.keys(groupedOrders).sort((a, b) => {
        // Сортируем месяцы от новых к старым
        const dateA = new Date(groupedOrders[a][0].created_at);
        const dateB = new Date(groupedOrders[b][0].created_at);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <div className="profile-section-container hide-scrollbar">
            {/* Шапка с кнопкой назад */}
            <div className="profile-modal-header">
                <button onClick={onBack} className="profile-modal-back btn-circle-35 bg-white">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M7 1L1 7L7 13" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h2 className="profile-modal-title">Мои заказы</h2>
                <div style={{ width: '35px' }}></div>
            </div>

            {/* Контент */}
            <div className="profile-section-content">
                {error && (
                    <div className="profile-section-error error-message">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="profile-section-empty">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="profile-section-empty-icon">
                            <circle cx="32" cy="32" r="32" fill="#F9F9F9"/>
                            <path d="M20 28L32 20L44 28V44C44 45.1046 43.1046 46 42 46H22C20.8954 46 20 45.1046 20 44V28Z" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M26 46V32H38V46" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="profile-section-empty-text">У вас пока нет заказов</p>
                    </div>
                ) : (
                    <div className="orders-history-content">
                        <div className="orders-history-white-block">
                            <h3 className="orders-history-subtitle">История заказов</h3>

                            {sortedMonths.map((monthYear) => (
                                <div key={monthYear} className="orders-history-month-group">
                                    <h4 className="orders-history-month-title">{monthYear}</h4>

                                    <div className="orders-history-list">
                                        {groupedOrders[monthYear].map((order) => {
                                            const firstProduct = order.items[0]?.product;
                                            const firstImage = firstProduct?.images?.[0]?.url;

                                            return (
                                                <button
                                                    key={order.id}
                                                    onClick={() => onViewOrder(order.id)}
                                                    className="orders-history-card"
                                                >
                                                    {/* Картинка первого товара */}
                                                    <div className="orders-history-card-image">
                                                        {firstImage ? (
                                                            <img src={firstImage} alt={firstProduct?.name || 'Товар'} />
                                                        ) : (
                                                            <div className="orders-history-card-image-placeholder">
                                                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                                                    <path d="M20 10L25 15H15L20 10Z" fill="#CCCCCC"/>
                                                                    <path d="M10 15H30V30H10V15Z" fill="#CCCCCC"/>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Информация о заказе */}
                                                    <div className="orders-history-card-info">
                                                        <div className="orders-history-card-header">
                                                            <span className="orders-history-card-number">
                                                                Заказ №{order.order_number}
                                                            </span>
                                                        </div>
                                                        <div className="orders-history-card-date">
                                                            {formatDateTime(order.created_at)}
                                                        </div>
                                                        <div className="orders-history-card-total">
                                                            {parseFloat(order.total).toLocaleString('ru-RU')} р
                                                        </div>
                                                        <div className="orders-history-card-status">
                                                            {getStatusText(order.status)}
                                                        </div>
                                                    </div>

                                                    {/* Кружочек статуса */}
                                                    <div
                                                        className="orders-history-card-status-badge"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        <img
                                                            src={getStatusIcon(order.status)}
                                                            alt={getStatusText(order.status)}
                                                            style={{ maxWidth: '10px', height: 'auto' }}
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersHistory;


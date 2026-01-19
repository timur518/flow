/**
 * CheckoutModal - Модальное окно оформления заказа
 * Размер: 755x650px, прижат к правой части сайта
 */

import React, { useState, useEffect } from 'react';
import { useAuth, useAddresses, useCity, useStores } from '@/hooks';
import { storeService, orderService } from '@/api/services';
import { DeliveryPeriod } from '@/api/types';
import CollapsibleBlock from '../common/CollapsibleBlock';
import AddressAutocomplete from '../common/AddressAutocomplete';

interface CartItem {
    id: number;
    name: string;
    price: string;
    quantity: number;
    image?: string;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onSubmit?: (orderData: any) => void;
}

type DeliveryMode = 'delivery' | 'pickup';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    items,
    onSubmit,
}) => {
    const { user } = useAuth();
    const { addresses } = useAddresses();
    const { selectedCityId } = useCity();
    const { stores, loading: storesLoading } = useStores({ city_id: selectedCityId || undefined });
    const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [deliveryCost, setDeliveryCost] = useState(0);
    const [deliveryPeriods, setDeliveryPeriods] = useState<DeliveryPeriod[]>([]);
    const [promoCodeApplied, setPromoCodeApplied] = useState(false);
    const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    // Данные заказчика
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: '',
    });

    // Данные получателя
    const [recipientData, setRecipientData] = useState({
        name: '',
        phone: '',
        social_link: '',
        address: '',
        delivery_date: '',
        delivery_time: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [clarifyWithRecipient, setClarifyWithRecipient] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
    const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
    const [deliveryZoneId, setDeliveryZoneId] = useState<number | null>(null);
    const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);

    // Расчет итоговой суммы
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const total = subtotal + (deliveryMode === 'delivery' ? deliveryCost : 0) - discount;

    // Подтягиваем данные авторизованного пользователя
    useEffect(() => {
        if (user) {
            setCustomerData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
            });
        }
    }, [user]);

    // Загружаем периоды доставки для выбранного города
    useEffect(() => {
        const loadDeliveryPeriods = async () => {
            // Загружаем только если модал открыт и магазины загружены
            if (!isOpen || storesLoading) {
                return;
            }

            if (stores.length > 0) {
                try {
                    const periods = await storeService.getDeliveryPeriods(stores[0].id);
                    setDeliveryPeriods(periods);
                } catch (error) {
                    console.error('Ошибка загрузки периодов доставки:', error);
                    setDeliveryPeriods([]);
                }
            } else {
                setDeliveryPeriods([]);
            }
        };

        loadDeliveryPeriods();
    }, [stores, selectedCityId, isOpen, storesLoading]);

    // Расчет стоимости доставки при изменении координат
    useEffect(() => {
        // Пропускаем расчет если:
        // - режим самовывоза
        // - адрес "Уточнить у получателя"
        // - нет координат
        // - нет магазинов
        if (
            deliveryMode !== 'delivery' ||
            clarifyWithRecipient ||
            !recipientData.latitude ||
            !recipientData.longitude ||
            stores.length === 0
        ) {
            return;
        }

        // Debounce: ждем 1 секунду после изменения координат
        const timeoutId = setTimeout(async () => {
            setIsCalculatingDelivery(true);
            setDeliveryMessage(null);

            try {
                const response = await orderService.calculateDelivery({
                    store_id: stores[0].id,
                    latitude: recipientData.latitude,
                    longitude: recipientData.longitude,
                    subtotal: subtotal,
                });

                if (response.success && response.data) {
                    setDeliveryCost(response.data.delivery_cost);
                    setDeliveryZoneId(response.data.zone_id);
                    setDeliveryMessage(response.data.message);
                } else {
                    // Адрес вне зон доставки
                    setDeliveryCost(0);
                    setDeliveryZoneId(null);
                    setDeliveryMessage(response.message || 'Адрес находится вне зон доставки');
                }
            } catch (error: any) {
                setDeliveryCost(0);
                setDeliveryZoneId(null);

                // Обрабатываем разные типы ошибок
                if (error.response?.status === 404) {
                    setDeliveryMessage('Адрес находится вне зон доставки');
                } else if (error.response?.data?.message) {
                    setDeliveryMessage(error.response.data.message);
                } else {
                    setDeliveryMessage('Не удалось рассчитать стоимость доставки');
                }
            } finally {
                setIsCalculatingDelivery(false);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [
        recipientData.latitude,
        recipientData.longitude,
        deliveryMode,
        clarifyWithRecipient,
        stores,
        subtotal,
    ]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerData({
            ...customerData,
            [name]: value,
        });

        // Очищаем ошибку для этого поля
        if (name === 'name' && validationErrors['customer_name']) {
            setValidationErrors({ ...validationErrors, customer_name: false });
        }
        if (name === 'phone' && validationErrors['customer_phone']) {
            setValidationErrors({ ...validationErrors, customer_phone: false });
        }
        if (name === 'email' && validationErrors['customer_email']) {
            setValidationErrors({ ...validationErrors, customer_email: false });
        }
    };

    const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRecipientData({
            ...recipientData,
            [name]: value,
        });

        // Очищаем ошибку для этого поля
        if (name === 'delivery_date') {
            const errorKey = deliveryMode === 'delivery' ? 'recipient_delivery_date' : 'pickup_date';
            if (validationErrors[errorKey]) {
                setValidationErrors({ ...validationErrors, [errorKey]: false });
            }
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            setPromoCodeError('Введите промокод');
            return;
        }

        setIsValidatingPromo(true);
        setPromoCodeError(null);

        try {
            const response = await orderService.validatePromoCode({
                code: promoCode,
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                })),
            });

            if (response.valid && response.calculation) {
                setDiscount(response.calculation.discount);
                setPromoCodeApplied(true);
                setPromoCodeError(null);
            } else {
                setDiscount(0);
                setPromoCodeApplied(false);
                setPromoCodeError(response.message || 'Промокод недействителен');
            }
        } catch (error: any) {
            setDiscount(0);
            setPromoCodeApplied(false);
            setPromoCodeError(error.message || 'Ошибка при проверке промокода');
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        setDiscount(0);
        setPromoCodeApplied(false);
        setPromoCodeError(null);
    };

    const validateForm = (): boolean => {
        const errors: {[key: string]: boolean} = {};

        // Валидация заказчика
        if (!customerData.name.trim()) {
            errors['customer_name'] = true;
        }
        if (!customerData.phone.trim() || customerData.phone === '+7') {
            errors['customer_phone'] = true;
        }
        if (!customerData.email.trim()) {
            errors['customer_email'] = true;
        }

        if (deliveryMode === 'delivery') {
            // Валидация получателя для доставки
            if (!recipientData.address.trim()) {
                errors['recipient_address'] = true;
            }
            // Проверяем координаты только если адрес не "Уточнить у получателя"
            if (!clarifyWithRecipient && (!recipientData.latitude || !recipientData.longitude)) {
                errors['recipient_address'] = true;
                alert('Пожалуйста, выберите адрес из выпадающего списка подсказок, чтобы система могла определить координаты для расчета доставки');
            }
            if (!recipientData.delivery_date) {
                errors['recipient_delivery_date'] = true;
            }
            if (!recipientData.delivery_time) {
                errors['recipient_delivery_time'] = true;
            }
        } else {
            // Валидация для самовывоза
            if (!recipientData.delivery_date) {
                errors['pickup_date'] = true;
            }
            if (!recipientData.delivery_time) {
                errors['pickup_time'] = true;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (onSubmit) {
            onSubmit({
                delivery_mode: deliveryMode,
                customer: customerData,
                recipient: recipientData,
                comment,
                promo_code: promoCode,
                discount,
                delivery_cost: deliveryCost,
                is_anonymous: isAnonymous,
                items,
                total,
            });
        }
    };

    // Форматирование телефона с маской +7(999)999-99-99
    const formatPhone = (value: string) => {
        // Удаляем все нецифровые символы
        const cleaned = value.replace(/\D/g, '');

        // Если пусто, возвращаем +7
        if (cleaned.length === 0) {
            return '+7';
        }

        // Убираем первую 7 или 8, если она есть
        const withoutCountryCode = cleaned.startsWith('7') || cleaned.startsWith('8')
            ? cleaned.substring(1)
            : cleaned;

        // Ограничиваем до 10 цифр
        const limited = withoutCountryCode.substring(0, 10);

        // Форматируем
        let formatted = '+7';
        if (limited.length > 0) {
            formatted += `(${limited.substring(0, 3)}`;
        }
        if (limited.length >= 4) {
            formatted += `)${limited.substring(3, 6)}`;
        }
        if (limited.length >= 7) {
            formatted += `-${limited.substring(6, 8)}`;
        }
        if (limited.length >= 9) {
            formatted += `-${limited.substring(8, 10)}`;
        }

        return formatted;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'customer' | 'recipient') => {
        const formatted = formatPhone(e.target.value);
        if (type === 'customer') {
            setCustomerData({ ...customerData, phone: formatted });
        } else {
            setRecipientData({ ...recipientData, phone: formatted });
        }
    };

    const handleToggleClarify = () => {
        if (!clarifyWithRecipient) {
            // Активируем toggle - заполняем адрес и блокируем
            setRecipientData({
                ...recipientData,
                address: 'Уточнить у получателя',
                latitude: null,
                longitude: null
            });
            setClarifyWithRecipient(true);
            // Сбрасываем стоимость доставки
            setDeliveryCost(0);
            setDeliveryZoneId(null);
            setDeliveryMessage(null);
            // Очищаем ошибку адреса
            if (validationErrors['recipient_address']) {
                setValidationErrors({ ...validationErrors, recipient_address: false });
            }
        } else {
            // Деактивируем toggle - очищаем адрес и разблокируем
            setRecipientData({
                ...recipientData,
                address: '',
                latitude: null,
                longitude: null
            });
            setClarifyWithRecipient(false);
            // Сбрасываем стоимость доставки
            setDeliveryCost(0);
            setDeliveryZoneId(null);
            setDeliveryMessage(null);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Длительность анимации
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`checkout-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`checkout-modal-container ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                {/* Заголовок и кнопка закрыть */}
                <div className="checkout-modal-header">
                    <h2 className="checkout-modal-title">Заказ</h2>
                    <button onClick={handleClose} className="btn-circle-35 bg-white">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="checkout-modal-content">
                    <div className="checkout-modal-columns">
                        {/* Левая колонка */}
                        <div className="checkout-modal-column-left">
                            {/* Переключатель режима доставки */}
                            <div className="checkout-delivery-toggle">
                                <button
                                    type="button"
                                    className={`checkout-delivery-toggle-btn ${deliveryMode === 'delivery' ? 'active' : ''}`}
                                    onClick={() => {
                                        setDeliveryMode('delivery');
                                    }}
                                >
                                    С доставкой
                                </button>
                                <button
                                    type="button"
                                    className={`checkout-delivery-toggle-btn ${deliveryMode === 'pickup' ? 'active' : ''}`}
                                    onClick={() => {
                                        setDeliveryMode('pickup');
                                        // Сбрасываем стоимость доставки при переключении на самовывоз
                                        setDeliveryCost(0);
                                        setDeliveryZoneId(null);
                                        setDeliveryMessage(null);
                                    }}
                                >
                                    Самовывоз
                                </button>
                            </div>

                            {deliveryMode === 'delivery' ? (
                                <>
                                {/* Блок 1: Заказчик */}
                                <CollapsibleBlock title="Заказчик" defaultOpen={!user}>
                                    <div className="checkout-form-fields">
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Имя <span className="required-asterisk">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={customerData.name}
                                                onChange={handleCustomerChange}
                                                className={`checkout-form-input ${validationErrors['customer_name'] ? 'error' : ''}`}
                                                placeholder="Введите имя"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Телефон <span className="required-asterisk">*</span></label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={customerData.phone}
                                                onChange={(e) => handlePhoneChange(e, 'customer')}
                                                className={`checkout-form-input ${validationErrors['customer_phone'] ? 'error' : ''}`}
                                                placeholder="+7(999)999-99-99"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Email <span className="required-asterisk">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={customerData.email}
                                                onChange={handleCustomerChange}
                                                className={`checkout-form-input ${validationErrors['customer_email'] ? 'error' : ''}`}
                                                placeholder="example@mail.com"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={isAnonymous}
                                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                                    className="checkout-checkbox"
                                                />
                                                <span>Анонимный заказ</span>
                                            </label>
                                            <p className="checkout-checkbox-hint">Не говорить получателю от кого заказ</p>
                                        </div>
                                    </div>
                                </CollapsibleBlock>

                                {/* Блок 2: Получатель */}
                                <CollapsibleBlock title="Получатель">
                                    <div className="checkout-form-fields">
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Имя</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={recipientData.name}
                                                onChange={handleRecipientChange}
                                                className="checkout-form-input"
                                                placeholder="Введите имя"
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Телефон</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={recipientData.phone}
                                                onChange={(e) => handlePhoneChange(e, 'recipient')}
                                                className="checkout-form-input"
                                                placeholder="+7(999)999-99-99"
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Ссылка на соц сеть</label>
                                            <input
                                                type="text"
                                                name="social_link"
                                                value={recipientData.social_link}
                                                onChange={handleRecipientChange}
                                                className="checkout-form-input"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="checkout-form-group checkout-address-group">
                                            <div className="checkout-address-label-row">
                                                <label className="checkout-form-label">Адрес <span className="required-asterisk">*</span></label>
                                                {addresses.length > 0 && !clarifyWithRecipient && (
                                                    <button type="button" className="checkout-saved-addresses-link">
                                                        Выбрать из сохраненных
                                                    </button>
                                                )}
                                            </div>
                                            <AddressAutocomplete
                                                value={recipientData.address}
                                                onChange={(value) => {
                                                    setRecipientData(prev => ({ ...prev, address: value }));
                                                    if (validationErrors['recipient_address']) {
                                                        setValidationErrors({ ...validationErrors, recipient_address: false });
                                                    }
                                                }}
                                                onCoordinatesChange={(latitude, longitude) => {
                                                    setRecipientData(prev => ({ ...prev, latitude, longitude }));
                                                }}
                                                className={`checkout-form-input ${validationErrors['recipient_address'] ? 'error' : ''}`}
                                                placeholder="Начните вводить..."
                                                required
                                                disabled={clarifyWithRecipient}
                                            />
                                        </div>
                                        <div className="checkout-toggle-field">
                                            <span className="checkout-toggle-label">Уточнить у получателя</span>
                                            <button
                                                type="button"
                                                className={`checkout-toggle ${clarifyWithRecipient ? 'active' : ''}`}
                                                onClick={handleToggleClarify}
                                            >
                                                <span className="checkout-toggle-circle"></span>
                                            </button>
                                        </div>
                                        <div className="checkout-form-row">
                                            <div className="checkout-form-group">
                                                <label className="checkout-form-label">Дата доставки <span className="required-asterisk">*</span></label>
                                                <input
                                                    type="date"
                                                    name="delivery_date"
                                                    value={recipientData.delivery_date}
                                                    onChange={handleRecipientChange}
                                                    className={`checkout-form-input ${validationErrors['recipient_delivery_date'] ? 'error' : ''}`}
                                                    required
                                                />
                                            </div>
                                            <div className="checkout-form-group">
                                                <label className="checkout-form-label">
                                                    Время доставки <span className="required-asterisk">*</span>
                                                </label>
                                                <select
                                                    name="delivery_time"
                                                    value={recipientData.delivery_time}
                                                    onChange={(e) => {
                                                        setRecipientData({ ...recipientData, delivery_time: e.target.value });
                                                        if (validationErrors['recipient_delivery_time']) {
                                                            setValidationErrors({ ...validationErrors, recipient_delivery_time: false });
                                                        }
                                                    }}
                                                    className={`checkout-form-input checkout-delivery-time-input ${validationErrors['recipient_delivery_time'] ? 'error' : ''}`}
                                                >
                                                    <option value="">
                                                        {deliveryPeriods.length === 0 ? 'Нет доступных периодов' : '--:--'}
                                                    </option>
                                                    {deliveryPeriods.map((period) => (
                                                        <option key={period.id} value={period.time_range}>
                                                            {period.time_range}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleBlock>

                                {/* Блок 3: Комментарий */}
                                <CollapsibleBlock title="Комментарий к заказу">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="checkout-form-textarea checkout-comment-full"
                                        placeholder="Добавить открытку или комментарий к доставке..."
                                        rows={3}
                                    />
                                </CollapsibleBlock>
                                </>
                            ) : (
                                <>
                                {/* Блок 1: Адрес магазина */}
                                <div className="white-block checkout-store-block">
                                    <div className="checkout-store-header">
                                        <span className="checkout-store-title">Адрес магазина</span>
                                        <button type="button" className="checkout-show-map-link">
                                            Показать на карте
                                        </button>
                                    </div>
                                    <div className="checkout-store-info">
                                        <div className="checkout-store-address">
                                            <svg className="checkout-store-icon" width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.65795 2.61188C3.88387 1.41048 5.53439 0.741414 7.25084 0.750083C8.96729 0.758752 10.611 1.44445 11.8247 2.65818C13.0384 3.87191 13.7241 5.51559 13.7328 7.23204C13.7415 8.94849 13.0724 10.599 11.871 11.8249L8.42762 15.2683C8.1191 15.5767 7.70072 15.75 7.26447 15.75C6.82823 15.75 6.40984 15.5767 6.10133 15.2683L2.65795 11.8249C1.4363 10.6032 0.75 8.94616 0.75 7.21841C0.75 5.49065 1.4363 3.83365 2.65795 2.61188Z" stroke="#222222" strokeWidth="1.5" strokeLinejoin="round"/>
                                                <path d="M7.26466 9.68605C8.62757 9.68605 9.73244 8.58119 9.73244 7.21827C9.73244 5.85535 8.62757 4.75049 7.26466 4.75049C5.90174 4.75049 4.79688 5.85535 4.79688 7.21827C4.79688 8.58119 5.90174 9.68605 7.26466 9.68605Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <div className="checkout-store-details">
                                                <div className="checkout-store-city">{stores.length > 0 ? stores[0].city?.name : 'Город'}</div>
                                                <div className="checkout-store-street">{stores.length > 0 ? stores[0].address : 'Адрес магазина'}</div>
                                                {stores.length > 0 && stores[0].working_hours && (
                                                    <div className="checkout-store-hours">{stores[0].working_hours}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Блок 2: Параметры заказа */}
                                <CollapsibleBlock title="Параметры заказа" defaultOpen={true}>
                                    <div className="checkout-form-fields">
                                        <div className="checkout-form-row">
                                            <div className="checkout-form-group">
                                                <label className="checkout-form-label">Когда заберу <span className="required-asterisk">*</span></label>
                                                <input
                                                    type="date"
                                                    name="pickup_date"
                                                    value={recipientData.delivery_date}
                                                    onChange={(e) => setRecipientData({ ...recipientData, delivery_date: e.target.value })}
                                                    className={`checkout-form-input ${validationErrors['pickup_date'] ? 'error' : ''}`}
                                                    required
                                                />
                                            </div>
                                            <div className="checkout-form-group">
                                                <label className="checkout-form-label">
                                                    Во сколько заберу <span className="required-asterisk">*</span>
                                                </label>
                                                <select
                                                    name="pickup_time"
                                                    value={recipientData.delivery_time}
                                                    onChange={(e) => {
                                                        setRecipientData({ ...recipientData, delivery_time: e.target.value });
                                                        if (validationErrors['pickup_time']) {
                                                            setValidationErrors({ ...validationErrors, pickup_time: false });
                                                        }
                                                    }}
                                                    className={`checkout-form-input checkout-delivery-time-input ${validationErrors['pickup_time'] ? 'error' : ''}`}
                                                >
                                                    <option value="">
                                                        {deliveryPeriods.length === 0 ? 'Нет доступных периодов' : '--:--'}
                                                    </option>
                                                    {deliveryPeriods.map((period) => (
                                                        <option key={period.id} value={period.time_range}>
                                                            {period.time_range}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleBlock>

                                {/* Блок 3: Заказчик */}
                                <CollapsibleBlock title="Заказчик" defaultOpen={!user}>
                                    <div className="checkout-form-fields">
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Имя <span className="required-asterisk">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={customerData.name}
                                                onChange={handleCustomerChange}
                                                className={`checkout-form-input ${validationErrors['customer_name'] ? 'error' : ''}`}
                                                placeholder="Ваше имя"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Телефон <span className="required-asterisk">*</span></label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={customerData.phone}
                                                onChange={handleCustomerChange}
                                                className={`checkout-form-input ${validationErrors['customer_phone'] ? 'error' : ''}`}
                                                placeholder="+7 (___) ___-__-__"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label className="checkout-form-label">Email <span className="required-asterisk">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={customerData.email}
                                                onChange={handleCustomerChange}
                                                className={`checkout-form-input ${validationErrors['customer_email'] ? 'error' : ''}`}
                                                placeholder="example@mail.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </CollapsibleBlock>

                                {/* Блок 4: Комментарий к заказу */}
                                <CollapsibleBlock title="Комментарий к заказу" defaultOpen={false}>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="checkout-form-textarea checkout-comment-full"
                                        placeholder="Добавить комментарий к заказу..."
                                        rows={3}
                                    />
                                </CollapsibleBlock>
                                </>
                            )}
                        </div>

                        {/* Правая колонка */}
                        <div className="checkout-modal-column-right">
                                {/* Блок 1: Мини-корзина */}
                                <CollapsibleBlock title="Состав заказа">
                                    <div className="checkout-cart-items">
                                        {items.map((item) => (
                                            <div key={item.id} className="checkout-cart-item">
                                                <img
                                                    src={item.image || '/placeholder-flower.jpg'}
                                                    alt={item.name}
                                                    className="checkout-cart-item-image"
                                                />
                                                <div className="checkout-cart-item-info">
                                                    <div className="checkout-cart-item-name">{item.name}</div>
                                                    <div className="checkout-cart-item-quantity">
                                                        {item.quantity} шт.
                                                    </div>
                                                </div>
                                                <div className="checkout-cart-item-price">
                                                    {(parseFloat(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleBlock>

                                {/* Блок 2: Промокод */}
                                <div className="white-block">
                                    <div className="checkout-promo">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => {
                                                setPromoCode(e.target.value);
                                                setPromoCodeError(null);
                                                if (promoCodeApplied) {
                                                    setPromoCodeApplied(false);
                                                    setDiscount(0);
                                                }
                                            }}
                                            className="checkout-promo-input"
                                            placeholder="Введите промокод"
                                            disabled={isValidatingPromo}
                                        />
                                        {!promoCodeApplied ? (
                                            <button
                                                type="button"
                                                onClick={handleApplyPromo}
                                                className="checkout-promo-button"
                                                disabled={isValidatingPromo || !promoCode.trim()}
                                            >
                                                {isValidatingPromo ? 'Проверка...' : 'Применить'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleRemovePromo}
                                                className="checkout-promo-button checkout-promo-button-remove"
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                    {promoCodeError && (
                                        <div className="checkout-promo-error">
                                            {promoCodeError}
                                        </div>
                                    )}
                                    {promoCodeApplied && discount > 0 && (
                                        <div className="checkout-promo-success">
                                            Промокод применен! Скидка: {discount.toLocaleString('ru-RU')} ₽
                                        </div>
                                    )}
                                </div>

                                {/* Блок 3: Подытоги и кнопка (прижаты к низу) */}
                                <div className="checkout-summary-bottom">
                                    <div className="checkout-totals">
                                        {deliveryMode === 'delivery' && (
                                            <>
                                                <div className="checkout-total-row">
                                                    <span>Доставка:</span>
                                                    <span>
                                                        {isCalculatingDelivery ? (
                                                            <span style={{ color: '#999' }}>Расчет...</span>
                                                        ) : (
                                                            `${deliveryCost.toLocaleString('ru-RU')} ₽`
                                                        )}
                                                    </span>
                                                </div>
                                                {deliveryMessage && !isCalculatingDelivery && (
                                                    <div className="checkout-delivery-message" style={{
                                                        fontSize: '12px',
                                                        color: deliveryZoneId ? '#666' : '#e74c3c',
                                                        marginTop: '4px',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {deliveryMessage}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {discount > 0 && (
                                            <div className="checkout-total-row">
                                                <span>Скидка:</span>
                                                <span>-{discount.toLocaleString('ru-RU')} ₽</span>
                                            </div>
                                        )}
                                        <div className="checkout-total-row checkout-total-final">
                                            <span>Итого:</span>
                                            <span>{total.toLocaleString('ru-RU')} ₽</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary">
                                        Оформить и оплатить
                                    </button>
                                </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;


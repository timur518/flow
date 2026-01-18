/**
 * EditAddress - Подраздел редактирования адреса
 * Используется внутри ProfileModal
 */

import React, { useState, useEffect } from 'react';
import { useAddresses } from '@/hooks';
import { Address } from '@/api/types';
import ProfileSectionSkeleton from './ProfileSectionSkeleton';
import { AddressAutocomplete } from '@/components/common';

interface EditAddressProps {
    addressId: number;
    onBack: () => void;
}

const EditAddress: React.FC<EditAddressProps> = ({ addressId, onBack }) => {
    const { addresses, updateAddress, deleteAddress, loading, error } = useAddresses();
    const [formData, setFormData] = useState({
        address: '',
        apartment: '',
        entrance: '',
        floor: '',
        intercom: '',
        comment: '',
    });
    const [coordinates, setCoordinates] = useState<{
        latitude: number | null;
        longitude: number | null;
    }>({
        latitude: null,
        longitude: null,
    });
    const [isDefault, setIsDefault] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const address = addresses.find(a => a.id === addressId);
        if (address) {
            setCurrentAddress(address);
            setFormData({
                address: address.address || '',
                apartment: address.apartment || '',
                entrance: address.entrance || '',
                floor: address.floor || '',
                intercom: address.intercom || '',
                comment: address.comment || '',
            });
            // Устанавливаем существующие координаты
            setCoordinates({
                latitude: address.latitude ? parseFloat(address.latitude) : null,
                longitude: address.longitude ? parseFloat(address.longitude) : null,
            });
            // Устанавливаем is_default
            setIsDefault(address.is_default || false);
        }
    }, [addressId, addresses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        try {
            // Обновляем адрес с новыми координатами (если они были изменены)
            const updateData = {
                ...formData,
                ...(coordinates.latitude && coordinates.longitude && {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                }),
                is_default: isDefault,
            };
            await updateAddress(addressId, updateData);
            setSuccessMessage('Адрес успешно обновлен');
            setTimeout(() => {
                onBack();
            }, 1500);
        } catch (err) {
            // Ошибка обрабатывается в хуке
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteAddress(addressId);
            setShowDeleteConfirm(false);
            setSuccessMessage('Адрес успешно удален');
            setTimeout(() => {
                onBack();
            }, 1000);
        } catch (err) {
            // Ошибка обрабатывается в хуке
            setShowDeleteConfirm(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    // Показываем скелетон во время загрузки
    if (loading && !currentAddress) {
        return <ProfileSectionSkeleton />;
    }

    if (!currentAddress) {
        return (
            <div className="profile-section-container">
                <div className="profile-modal-header">
                    <button onClick={onBack} className="profile-modal-back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h2 className="profile-modal-title">Редактировать адрес</h2>
                    <div style={{ width: '35px' }}></div>
                </div>
                <div className="profile-section-content">
                    <div className="profile-section-empty">
                        <p className="profile-section-empty-text">Адрес не найден</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-section-container hide-scrollbar">
            {/* Шапка с кнопкой назад */}
            <div className="profile-modal-header">
                <button onClick={onBack} className="profile-modal-back btn-circle-35 bg-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h2 className="profile-modal-title">Изменить адрес</h2>
                <div style={{ width: '35px' }}></div>
            </div>

            {/* Форма редактирования */}
            <form onSubmit={handleSubmit} className="profile-section-content">
                {error && (
                    <div className="profile-section-error error-message">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="profile-section-success success-message">
                        {successMessage}
                    </div>
                )}

                <div className="profile-section-form white-block">
                    <div className="profile-section-form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="address" className="profile-section-label">
                                Адрес *
                            </label>
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                disabled={loading}
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    color: '#737373',
                                    background: 'none',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    padding: 0,
                                    opacity: loading ? 0.5 : 1,
                                }}
                            >
                                Удалить адрес
                            </button>
                        </div>
                        <AddressAutocomplete
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={(value) => setFormData({ ...formData, address: value })}
                            onCoordinatesChange={(lat, lon) =>
                                setCoordinates({ latitude: lat, longitude: lon })
                            }
                            required
                            className="profile-section-input"
                            placeholder="Город, улица, дом"
                        />
                    </div>

                    <div className="profile-section-form-row profile-section-form-row-narrow">
                        <div className="profile-section-form-group">
                            <label htmlFor="entrance" className="profile-section-label">
                                Подъезд
                            </label>
                            <input
                                type="text"
                                id="entrance"
                                name="entrance"
                                value={formData.entrance}
                                onChange={handleChange}
                                className="profile-section-input"
                                placeholder="1"
                            />
                        </div>

                        <div className="profile-section-form-group">
                            <label htmlFor="floor" className="profile-section-label">
                                Этаж
                            </label>
                            <input
                                type="text"
                                id="floor"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                className="profile-section-input"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div className="profile-section-form-row profile-section-form-row-narrow">
                        <div className="profile-section-form-group">
                            <label htmlFor="apartment" className="profile-section-label">
                                Квартира
                            </label>
                            <input
                                type="text"
                                id="apartment"
                                name="apartment"
                                value={formData.apartment}
                                onChange={handleChange}
                                className="profile-section-input"
                                placeholder="123"
                            />
                        </div>

                        <div className="profile-section-form-group">
                            <label htmlFor="intercom" className="profile-section-label">
                                Домофон
                            </label>
                            <input
                                type="text"
                                id="intercom"
                                name="intercom"
                                value={formData.intercom}
                                onChange={handleChange}
                                className="profile-section-input"
                                 placeholder="123"
                            />
                        </div>
                    </div>

                    <div className="profile-section-form-group">
                        <label htmlFor="comment" className="profile-section-label">
                            Комментарий
                        </label>
                        <textarea
                            id="comment"
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            className="profile-section-textarea"
                            placeholder="Например: домофон не работает, звоните по телефону"
                            rows={3}
                        />
                    </div>

                    <div className="profile-section-form-group">
                        <label className="profile-section-checkbox-label">
                            <input
                                type="checkbox"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="profile-section-checkbox"
                            />
                            <span className="profile-section-checkbox-text">
                                Адрес по умолчанию
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="profile-section-submit btn-primary"
                >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </form>

            {/* Всплывающее окно подтверждения удаления */}
            {showDeleteConfirm && (
                <div className="auth-success-overlay">
                    <div className="auth-success-notification">
                        <p className="auth-success-text">
                            Вы действительно хотите удалить адрес?
                        </p>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={loading}
                            className="auth-success-button"
                        >
                            {loading ? 'Удаление...' : 'Да, удалить'}
                        </button>
                        <button
                            onClick={handleDeleteCancel}
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '45px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'transparent',
                                border: '1px solid #E0E0E0',
                                borderRadius: '100px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#737373',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditAddress;


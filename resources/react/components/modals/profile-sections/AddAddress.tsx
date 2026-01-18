/**
 * AddAddress - Подраздел добавления нового адреса
 * Используется внутри ProfileModal
 */

import React, { useState } from 'react';
import { useAddresses } from '@/hooks';
import { AddressAutocomplete } from '@/components/common';

interface AddAddressProps {
    onBack: () => void;
}

const AddAddress: React.FC<AddAddressProps> = ({ onBack }) => {
    const { createAddress, loading, error } = useAddresses();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        try {
            // Используем координаты из DaData или дефолтные (центр Москвы)
            const addressData = {
                ...formData,
                latitude: coordinates.latitude || 55.751244,
                longitude: coordinates.longitude || 37.618423,
                is_default: isDefault,
            };
            await createAddress(addressData);
            setSuccessMessage('Адрес успешно добавлен');
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

    return (
        <div className="profile-section-container hide-scrollbar">
            {/* Шапка с кнопкой назад */}
            <div className="profile-modal-header">
                <button onClick={onBack} className="profile-modal-back btn-circle-35 bg-white">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M7 1L1 7L7 13" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h2 className="profile-modal-title">Добавить адрес</h2>
                <div style={{ width: '35px' }}></div>
            </div>

            {/* Форма добавления адреса */}
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
                        <label htmlFor="address" className="profile-section-label">
                            Адрес <span className="profile-section-required">*</span>
                        </label>
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
                    {loading ? 'Сохранение...' : 'Добавить адрес'}
                </button>
            </form>
        </div>
    );
};

export default AddAddress;


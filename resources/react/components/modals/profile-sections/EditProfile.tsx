/**
 * EditProfile - Подраздел редактирования профиля
 * Используется внутри ProfileModal
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';

interface EditProfileProps {
    onBack: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onBack }) => {
    const { user, updateProfile, loading, error } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        try {
            await updateProfile(formData);
            setSuccessMessage('Профиль успешно обновлен');
            setTimeout(() => {
                onBack();
            }, 1500);
        } catch (err) {
            // Ошибка обрабатывается в хуке
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <h2 className="profile-modal-title">Редактировать профиль</h2>
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
                    <label htmlFor="email" className="profile-section-label">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled
                        className="profile-section-input"
                        placeholder="your@email.com"
                    />
                </div>

                <div className="profile-section-form-group">
                    <label htmlFor="name" className="profile-section-label">
                        Имя
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="profile-section-input"
                        placeholder="Введите ваше имя"
                    />
                </div>

                <div className="profile-section-form-group">
                    <label htmlFor="phone" className="profile-section-label">
                        Телефон
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="profile-section-input"
                        placeholder="+7 (999) 123-45-67"
                    />
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
        </div>
    );
};

export default EditProfile;


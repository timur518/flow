/**
 * RegisterForm - Форма регистрации
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks';

interface RegisterFormProps {
    onBack: () => void;
    onClose: () => void;
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
    onBack,
    onClose,
    onSwitchToLogin,
    onSuccess,
}) => {
    const { register, loading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            onSuccess();
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

    // Форматирование телефона
    const formatPhone = (value: string) => {
        // Удаляем все нецифровые символы
        const cleaned = value.replace(/\D/g, '');

        // Применяем маску +7(999)999-99-99
        let formatted = '+7';
        if (cleaned.length > 1) {
            formatted += '(' + cleaned.substring(1, 4);
        }
        if (cleaned.length >= 5) {
            formatted += ')' + cleaned.substring(4, 7);
        }
        if (cleaned.length >= 8) {
            formatted += '-' + cleaned.substring(7, 9);
        }
        if (cleaned.length >= 10) {
            formatted += '-' + cleaned.substring(9, 11);
        }

        return formatted;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData({
            ...formData,
            phone: formatted,
        });
    };

    return (
        <div className="profile-section-container profile-section-container-tall hide-scrollbar">
            {/* Шапка */}
            <div className="profile-modal-header">
                <button onClick={() => {
                    clearError();
                    onBack();
                }} className="profile-section-back btn-circle-35 bg-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8 2L4 6L8 10" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h2 className="profile-modal-title">Регистрация</h2>
                <button onClick={onClose} className="profile-modal-close btn-circle-35 bg-white">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="auth-form">
                {/* Белый блок с полями */}
                <div className="auth-form-fields white-block">
                    {/* Имя */}
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Имя</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="auth-form-input input-field"
                            required
                        />
                    </div>

                    {/* Телефон */}
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Телефон</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className="auth-form-input input-field"
                            placeholder="+7(999)999-99-99"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Электронная почта</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="auth-form-input input-field"
                            required
                        />
                    </div>

                    {/* Пароль */}
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="auth-form-input input-field"
                            required
                        />
                    </div>

                    {/* Подтверждение пароля */}
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Подтверждение пароля</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="auth-form-input input-field"
                            required
                        />
                    </div>
                </div>

                {/* Ошибка */}
                {error && (
                    <div className="auth-form-error error-message">
                        {error}
                    </div>
                )}

                {/* Переключение на вход */}
                <div className="auth-form-switch">
                    <span className="auth-form-switch-text">
                        Уже зарегистрированы?<br />
                        <button
                            type="button"
                            onClick={() => {
                                clearError();
                                onSwitchToLogin();
                            }}
                            className="auth-form-switch-link"
                        >
                            Войти
                        </button>
                    </span>
                </div>

                {/* Кнопка регистрации */}
                <button
                    type="submit"
                    disabled={loading}
                    className="auth-form-submit btn-primary"
                >
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>

                {/* Юридическая информация */}
                <p className="auth-form-legal">
                    Продолжая регистрацию, вы соглашаетесь с политикой конфиденциальности, условиями сервиса и условиями продажи товаров
                </p>
            </form>
        </div>
    );
};

export default RegisterForm;


/**
 * LoginForm - Форма авторизации
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks';

interface LoginFormProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword: () => void;
    onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
    onClose,
    onSwitchToRegister,
    onSwitchToForgotPassword,
    onSuccess,
}) => {
    const { login, loading, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData);
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

    return (
        <div className="profile-modal-container hide-scrollbar">
            {/* Шапка */}
            <div className="profile-modal-header profile-modal-header-profile">
                <h2 className="profile-modal-title">Войти в профиль</h2>
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
                    {/* Поле Email или телефон */}
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Эл. почта или телефон</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className="auth-form-input input-field"
                            required
                        />
                    </div>

                    {/* Поле Пароль */}
                    <div className="auth-form-field">
                        <div className="auth-form-label-row">
                            <label className="auth-form-label form-label">Пароль</label>
                            <button
                                type="button"
                                onClick={() => {
                                    clearError();
                                    onSwitchToForgotPassword();
                                }}
                                className="auth-form-forgot-link"
                            >
                                Забыли пароль?
                            </button>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
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

                {/* Переключение на регистрацию */}
                <div className="auth-form-switch">
                    <span className="auth-form-switch-text">
                        Нет аккаунта?<br />
                        <button
                            type="button"
                            onClick={() => {
                                clearError();
                                onSwitchToRegister();
                            }}
                            className="auth-form-switch-link"
                        >
                            Зарегистрироваться
                        </button>
                    </span>
                </div>

                {/* Кнопка входа */}
                <button
                    type="submit"
                    disabled={loading}
                    className="auth-form-submit btn-primary"
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>

                {/* Юридическая информация */}
                <p className="auth-form-legal">
                    Продолжая авторизацию, вы соглашаетесь с политикой конфиденциальности, условиями сервиса и условиями продажи товаров
                </p>
            </form>
        </div>
    );
};

export default LoginForm;


/**
 * ForgotPasswordForm - Форма восстановления пароля
 */

import React, { useState } from 'react';
import { authService } from '@/api/services';

interface ForgotPasswordFormProps {
    onBack: () => void;
    onClose: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.forgotPassword(email);
            setShowSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Ошибка отправки письма');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        onBack();
    };

    const handleBack = () => {
        setError(null);
        onBack();
    };

    return (
        <div className="profile-section-container hide-scrollbar">
            {/* Шапка */}
            <div className="profile-modal-header">
                <button onClick={handleBack} className="profile-section-back btn-circle-35 bg-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8 2L4 6L8 10" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h2 className="profile-modal-title">Восстановить пароль</h2>
                <button onClick={onClose} className="profile-modal-close btn-circle-35 bg-white">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1L7 7M1 7L7 1" stroke="#737373" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="auth-form auth-form-forgot">
                {/* Описание */}
                <p className="auth-form-description">
                    Отправим письмо для смены пароля
                </p>

                {/* Белый блок с полем */}
                <div className="auth-form-fields white-block">
                    <div className="auth-form-field">
                        <label className="auth-form-label form-label">Эл. почта</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                {/* Кнопка восстановления */}
                <button
                    type="submit"
                    disabled={loading}
                    className="auth-form-submit btn-primary"
                >
                    {loading ? 'Отправка...' : 'Восстановить пароль'}
                </button>
            </form>

            {/* Уведомление об успешной отправке */}
            {showSuccess && (
                <div className="auth-success-overlay">
                    <div className="auth-success-notification">
                        <p className="auth-success-text">
                            Письмо со ссылкой на сброс пароля отправлено на вашу почту
                        </p>
                        <button
                            onClick={handleSuccessClose}
                            className="auth-success-button"
                        >
                            Спасибо
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordForm;


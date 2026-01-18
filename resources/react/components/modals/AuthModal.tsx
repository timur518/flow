/**
 * AuthModal - Модальное окно авторизации
 * С динамической загрузкой подразделов (Авторизация, Регистрация, Восстановление пароля)
 */

import React, { useState, lazy, Suspense, useEffect } from 'react';
import Modal from './Modal';
import { ProfileSectionSkeleton } from './profile-sections';

// Ленивая загрузка подразделов
const LoginForm = lazy(() => import('./auth-sections/LoginForm'));
const RegisterForm = lazy(() => import('./auth-sections/RegisterForm'));
const ForgotPasswordForm = lazy(() => import('./auth-sections/ForgotPasswordForm'));

type AuthSection = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSection?: AuthSection;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialSection = 'login' }) => {
    // Состояние для управления подразделами
    const [currentSection, setCurrentSection] = useState<AuthSection>(initialSection);
    const [animationDirection, setAnimationDirection] = useState<'forward' | 'back' | null>(null);

    // Предзагрузка компонентов при открытии модального окна
    useEffect(() => {
        if (isOpen) {
            // Предзагружаем компоненты в фоне
            import('./auth-sections/LoginForm');
            import('./auth-sections/RegisterForm');
            import('./auth-sections/ForgotPasswordForm');
        }
    }, [isOpen]);

    // Сброс на начальную секцию при открытии
    useEffect(() => {
        if (isOpen) {
            setCurrentSection(initialSection);
        }
    }, [isOpen, initialSection]);

    // Навигация между подразделами
    const navigateToSection = (section: AuthSection) => {
        setAnimationDirection('forward');
        setCurrentSection(section);

        // Сбрасываем анимацию после её завершения (350ms анимация)
        setTimeout(() => {
            setAnimationDirection(null);
        }, 350);
    };

    const navigateBack = () => {
        setAnimationDirection('back');
        setCurrentSection('login');

        // Сбрасываем анимацию после её завершения (350ms анимация)
        setTimeout(() => {
            setAnimationDirection(null);
        }, 350);
    };

    // Сброс состояния при закрытии модалки
    const handleClose = () => {
        setCurrentSection('login');
        setAnimationDirection(null);
        onClose();
    };

    // Успешная авторизация/регистрация
    const handleSuccess = () => {
        handleClose();
    };

    // Определяем класс анимации
    const getAnimationClass = () => {
        if (!animationDirection) return '';
        return animationDirection === 'forward' ? 'slide-left' : 'slide-right';
    };

    // Определяем высоту модального окна в зависимости от секции
    const getModalHeight = () => {
        switch (currentSection) {
            case 'register':
                return 750; // Увеличенная высота для регистрации
            case 'login':
            case 'forgot-password':
            default:
                return 600; // Стандартная высота
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="sm" height={getModalHeight()}>
            <div className={`profile-modal-wrapper ${getAnimationClass()}`}>
                {/* Форма входа */}
                {currentSection === 'login' && (
                    <Suspense fallback={<div key="skeleton-login"><ProfileSectionSkeleton hasBackButton={false} /></div>}>
                        <div key="login">
                            <LoginForm
                                onClose={handleClose}
                                onSwitchToRegister={() => navigateToSection('register')}
                                onSwitchToForgotPassword={() => navigateToSection('forgot-password')}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    </Suspense>
                )}

                {/* Форма регистрации */}
                {currentSection === 'register' && (
                    <Suspense fallback={<div key="skeleton-register"><ProfileSectionSkeleton /></div>}>
                        <div key="register">
                            <RegisterForm
                                onBack={navigateBack}
                                onClose={handleClose}
                                onSwitchToLogin={() => navigateToSection('login')}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    </Suspense>
                )}

                {/* Форма восстановления пароля */}
                {currentSection === 'forgot-password' && (
                    <Suspense fallback={<div key="skeleton-forgot"><ProfileSectionSkeleton /></div>}>
                        <div key="forgot-password">
                            <ForgotPasswordForm
                                onBack={navigateBack}
                                onClose={handleClose}
                            />
                        </div>
                    </Suspense>
                )}
            </div>
        </Modal>
    );
};

export default AuthModal;


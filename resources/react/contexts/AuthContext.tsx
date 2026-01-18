/**
 * AuthContext - Контекст авторизации
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/api/services';
import { User, LoginData, RegisterData, UpdateProfileData, ChangePasswordData } from '@/api/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    register: (data: RegisterData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    getProfile: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    changePassword: (data: ChangePasswordData) => Promise<void>;
    isAuthenticated: () => boolean;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка профиля при монтировании
    useEffect(() => {
        if (authService.isAuthenticated()) {
            getProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const register = async (data: RegisterData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.register(data);
            setUser(response.user);
        } catch (err: any) {
            setError(err.message || 'Ошибка регистрации');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: LoginData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(data);
            setUser(response.user);
        } catch (err: any) {
            setError(err.message || 'Ошибка входа');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await authService.logout();
            setUser(null);
        } catch (err: any) {
            setError(err.message || 'Ошибка выхода');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки профиля');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: UpdateProfileData) => {
        try {
            setLoading(true);
            setError(null);
            const updatedUser = await authService.updateProfile(data);
            setUser(updatedUser);
        } catch (err: any) {
            setError(err.message || 'Ошибка обновления профиля');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (data: ChangePasswordData) => {
        try {
            setLoading(true);
            setError(null);
            await authService.changePassword(data);
        } catch (err: any) {
            setError(err.message || 'Ошибка изменения пароля');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        getProfile,
        updateProfile,
        changePassword,
        isAuthenticated,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


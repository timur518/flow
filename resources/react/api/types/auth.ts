/**
 * Auth Types
 * Типы для аутентификации
 */

import { BaseModel, Timestamps } from './common';

export interface User extends BaseModel, Timestamps {
    name: string;
    email: string;
    phone: string | null;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
}

export interface LoginData {
    login: string; // email или телефон
    password: string;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
}

export interface ChangePasswordData {
    current_password: string;
    password: string;
    password_confirmation: string;
}


/**
 * API Configuration
 * Конфигурация для работы с API
 */

export const API_CONFIG = {
    // Базовый URL API
    BASE_URL: '/api/v1',

    // Таймаут запросов (в миллисекундах)
    TIMEOUT: 30000,

    // Ключ для хранения токена в localStorage
    TOKEN_KEY: 'auth_token',

    // Заголовки по умолчанию
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
} as const;

/**
 * Endpoints API
 */
export const API_ENDPOINTS = {
    // Настройки сайта
    SETTINGS: '/settings',

    // Баннеры
    BANNERS: '/banners',

    // Категории
    CATEGORIES: '/categories',

    // Теги
    TAGS: '/tags',

    // Города
    CITIES: '/cities',

    // Магазины
    STORES: '/stores',
    STORE_DETAIL: (id: number) => `/stores/${id}`,
    STORE_DELIVERY_PERIODS: (id: number) => `/stores/${id}/delivery-periods`,
    STORE_DELIVERY_ZONES: (id: number) => `/stores/${id}/delivery-zones`,

    // Товары
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id: number) => `/products/${id}`,

    // Промокоды
    PROMO_CODE_VALIDATE: '/promo-codes/validate',

    // Доставка
    DELIVERY_CALCULATE: '/delivery/calculate',

    // Аутентификация
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        UPDATE_PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },

    // Адреса
    ADDRESSES: '/addresses',
    ADDRESS_DETAIL: (id: number) => `/addresses/${id}`,
    ADDRESS_SET_DEFAULT: (id: number) => `/addresses/${id}/set-default`,

    // Заказы
    ORDERS: '/orders',
    ORDER_DETAIL: (id: number) => `/orders/${id}`,
    ORDER_UPDATE_STATUS: (id: number) => `/orders/${id}/update-status`,
} as const;


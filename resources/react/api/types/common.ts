/**
 * Common Types
 * Общие типы для API
 */

/**
 * Стандартный ответ API
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Ответ с ошибкой
 */
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * Параметры пагинации
 */
export interface PaginationParams {
    page?: number;
    per_page?: number;
}

/**
 * Параметры сортировки
 */
export interface SortParams {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

/**
 * Базовая модель с ID
 */
export interface BaseModel {
    id: number;
}

/**
 * Модель с временными метками
 */
export interface Timestamps {
    created_at: string;
    updated_at: string;
}


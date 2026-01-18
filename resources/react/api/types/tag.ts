/**
 * Tag Types
 * Типы для тегов
 */

import { BaseModel } from './common';

export interface Tag extends BaseModel {
    name: string;
    color: string;
    sort_order: number;
    is_active: boolean;
}

export interface TagParams {
    include_inactive?: boolean;
}


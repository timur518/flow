/**
 * Category Types
 * Типы для категорий
 */

import { BaseModel } from './common';

export interface Category extends BaseModel {
    name: string;
    slug: string;
    image: string | null;
    menu_image: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface CategoryParams {
    include_inactive?: boolean;
}


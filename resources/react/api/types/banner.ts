/**
 * Banner Types
 * Типы для баннеров
 */

import { BaseModel } from './common';

export interface Banner extends BaseModel {
    image: string;
    name: string;
    city_id: number | null;
    sort_order: number;
}

export interface BannerParams {
    city_id?: number;
}


/**
 * City Types
 * Типы для городов
 */

import { BaseModel } from './common';

export interface City extends BaseModel {
    name: string;
    region: string | null;
    latitude: string | null;
    longitude: string | null;
    sort_order: number;
}


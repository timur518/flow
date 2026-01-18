/**
 * Address Types
 * Типы для адресов доставки
 */

import { BaseModel, Timestamps } from './common';

export interface Address extends BaseModel, Timestamps {
    user_id: number;
    address: string;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
    intercom: string | null;
    comment: string | null;
    latitude: string | null;
    longitude: string | null;
    is_default: boolean;
}

export interface CreateAddressData {
    address: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    intercom?: string;
    comment?: string;
    latitude?: string;
    longitude?: string;
    is_default?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}


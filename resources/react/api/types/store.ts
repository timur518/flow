/**
 * Store Types
 * Типы для магазинов
 */

import { BaseModel } from './common';
import { City } from './city';

export interface Store extends BaseModel {
    city: {
        id: number;
        name: string;
    };
    address: string;
    phone: string | null;
    email: string | null;
    latitude: string | null;
    longitude: string | null;
    yandex_maps_url: string | null;
    working_hours: string | null;
    social_links: SocialLinks;
    sort_order: number;
}

export interface StoreDetail extends Store {
    yandex_maps_code: string | null;
    legal_info: LegalInfo;
    payment_settings: PaymentSettings;
    delivery_periods: DeliveryPeriod[];
    delivery_zones: DeliveryZone[];
}

export interface SocialLinks {
    whatsapp: string | null;
    telegram_chat: string | null;
    telegram_channel: string | null;
    telegram_chat_id?: string | null;
    max_chat: string | null;
    max_group: string | null;
    instagram: string | null;
    vk: string | null;
}

export interface LegalInfo {
    legal_name: string | null;
    inn: string | null;
    ogrn: string | null;
    legal_address: string | null;
}

export interface PaymentSettings {
    orders_blocked: boolean;
    payment_on_delivery: boolean;
    payment_online: boolean;
}

export interface DeliveryPeriod extends BaseModel {
    time_range: string;
    sort_order: number;
}

export interface DeliveryZone extends BaseModel {
    name: string;
    polygon_coordinates: [number, number][] | null;
    delivery_cost: string;
    min_free_delivery_amount: string;
    sort_order: number;
}

export interface StoreParams {
    city_id?: number;
}


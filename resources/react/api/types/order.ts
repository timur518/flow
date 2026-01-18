/**
 * Order Types
 * Типы для заказов
 */

import { BaseModel, Timestamps } from './common';
import { User } from './auth';

export interface Order extends BaseModel, Timestamps {
    order_number: string;
    user_id: number;
    city_id: number;
    store_id: number;
    status: OrderStatus;
    payment_type: PaymentType;
    payment_status: PaymentStatus;
    delivery_type: DeliveryType;
    delivery_date: string;
    delivery_time: string | null;
    delivery_address: string | null;
    delivery_cost: string;
    delivery_zone_id: number | null;
    recipient_name: string;
    recipient_phone: string;
    recipient_social: string | null;
    comment: string | null;
    promo_code: string | null;
    discount_amount: string;
    discount: string;
    subtotal: string;
    total: string;
    payment_id: string | null;
    payment_url: string | null;
    is_anonymous: boolean;
    customer_phone: string | null;
    courier: string | null;
    items: OrderItem[];
    user?: User;
    city?: {
        id: number;
        name: string;
    };
}

export interface OrderItem extends BaseModel {
    order_id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: string;
    total: string;
    product?: {
        id: number;
        name: string;
        images: Array<{
            id: number;
            url: string;
            sort_order: number;
        }>;
    };
}

export interface CreateOrderData {
    city_id: number;
    store_id: number;
    payment_type: PaymentType;
    delivery_type: DeliveryType;
    delivery_date: string;
    delivery_time: string;
    delivery_address?: string;
    delivery_latitude?: string;
    delivery_longitude?: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_social?: string;
    comment?: string;
    promo_code?: string;
    is_anonymous?: boolean;
    items: OrderItemData[];
}

export interface OrderItemData {
    product_id: number;
    quantity: number;
}

export type OrderStatus = 'new' | 'processing' | 'assembling' | 'awaiting_delivery' | 'delivering' | 'completed' | 'cancelled';
export type PaymentType = 'cash' | 'online';
export type PaymentStatus = 'pending' | 'succeeded' | 'cancelled';
export type DeliveryType = 'delivery' | 'pickup';

export interface PromoCodeValidation {
    code: string;
    items: Array<{
        product_id: number;
        quantity: number;
    }>;
}

export interface PromoCodeResponse {
    valid: boolean;
    promo_code?: {
        code: string;
        discount_type: 'percentage' | 'fixed';
        discount_value: number;
    };
    calculation?: {
        subtotal: number;
        discount: number;
        total: number;
    };
    message?: string;
}

export interface DeliveryCalculation {
    latitude: number;
    longitude: number;
    store_id: number;
    subtotal: number;
}

export interface DeliveryCalculationResponse {
    success: boolean;
    data: {
        zone_id: number;
        zone_name: string;
        delivery_cost: number;
        is_free: boolean;
        min_free_delivery_amount: number | null;
        message: string | null;
    } | null;
    message: string | null;
}


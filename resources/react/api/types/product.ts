/**
 * Product Types
 * Типы для товаров
 */

import { BaseModel, SortParams } from './common';

export interface Product extends BaseModel {
    name: string;
    price: string;
    sale_price: string | null;
    image: string | null;
    width: number | null;
    height: number | null;
    categories: ProductCategory[];
    tags: ProductTag[];
}

export interface ProductDetail extends Product {
    description: string | null;
    images: ProductImage[];
    cities: ProductCity[];
    ingredients: ProductIngredient[];
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
}

export interface ProductTag {
    id: number;
    name: string;
    color: string;
}

export interface ProductImage extends BaseModel {
    image: string;
    sort_order: number;
}

export interface ProductCity {
    id: number;
    name: string;
}

export interface ProductIngredient extends BaseModel {
    name: string;
    quantity: number;
}

export interface ProductParams extends SortParams {
    city_id?: number;
    category_id?: number;
    tag_id?: number;
    search?: string;
    on_sale?: boolean;
    random?: boolean;
    limit?: number;
}


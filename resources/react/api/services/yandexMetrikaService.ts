/**
 * Yandex Metrika E-commerce Service
 * Сервис для отправки данных электронной коммерции в Яндекс Метрику
 * 
 * Документация: https://yandex.ru/support/metrica/ru/ecommerce/data.html
 */

import { Product, ProductDetail } from '@/api/types';

// Типы для электронной коммерции Яндекс Метрики
interface YMProduct {
    id: string | number;
    name: string;
    price: number;
    brand?: string;
    category?: string;
    variant?: string;
    quantity?: number;
}

interface YMEcommerceData {
    currencyCode?: string;
    [key: string]: any;
}

// Глобальный объект dataLayer для Яндекс Метрики
declare global {
    interface Window {
        dataLayer: any[];
    }
}

class YandexMetrikaService {
    private isEnabled: boolean = false;

    constructor() {
        // Проверяем наличие dataLayer
        if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            this.isEnabled = true;
        }
    }

    /**
     * Отправка данных в dataLayer
     */
    private push(data: any): void {
        if (!this.isEnabled) {
            console.warn('Yandex Metrika dataLayer не доступен');
            return;
        }

        try {
            window.dataLayer.push(data);
            console.log('YM E-commerce event:', data);
        } catch (error) {
            console.error('Ошибка отправки данных в Yandex Metrika:', error);
        }
    }

    /**
     * Преобразование Product в формат YM
     */
    private formatProduct(product: Product | ProductDetail, quantity: number = 1): YMProduct {
        return {
            id: product.id,
            name: product.name,
            price: product.sale_price || product.price,
            category: 'category' in product && product.category ? product.category.name : undefined,
            quantity: quantity,
        };
    }

    /**
     * 1. Просмотр товара (detail)
     * Вызывается при открытии карточки товара
     */
    viewProduct(product: Product | ProductDetail): void {
        this.push({
            ecommerce: {
                currencyCode: 'RUB',
                detail: {
                    products: [this.formatProduct(product)],
                },
            },
        });
    }

    /**
     * 2. Добавление товара в корзину (add)
     * Вызывается при добавлении товара в корзину
     */
    addToCart(product: Product | ProductDetail, quantity: number = 1): void {
        this.push({
            ecommerce: {
                currencyCode: 'RUB',
                add: {
                    products: [this.formatProduct(product, quantity)],
                },
            },
        });
    }

    /**
     * 3. Удаление товара из корзины (remove)
     * Вызывается при удалении товара из корзины
     */
    removeFromCart(product: Product | ProductDetail, quantity: number = 1): void {
        this.push({
            ecommerce: {
                currencyCode: 'RUB',
                remove: {
                    products: [this.formatProduct(product, quantity)],
                },
            },
        });
    }

    /**
     * 4. Оформление заказа (purchase)
     * Вызывается при успешном оформлении заказа
     */
    purchase(
        orderId: string | number,
        products: Array<{ product: Product | ProductDetail; quantity: number }>,
        totalPrice: number
    ): void {
        this.push({
            ecommerce: {
                currencyCode: 'RUB',
                purchase: {
                    actionField: {
                        id: orderId.toString(),
                        revenue: totalPrice,
                    },
                    products: products.map(({ product, quantity }) =>
                        this.formatProduct(product, quantity)
                    ),
                },
            },
        });
    }
}

// Экспортируем singleton
export const yandexMetrikaService = new YandexMetrikaService();


/**
 * ProductSchema - Компонент для Schema.org разметки товара
 * 
 * Генерирует JSON-LD разметку для поисковых систем (Google, Яндекс)
 * Визуально ничего не отображает
 */

import { useEffect } from 'react';
import { ProductDetail, Product } from '@/api/types';

interface ProductSchemaProps {
    product: ProductDetail | Product | null;
}

const ProductSchema: React.FC<ProductSchemaProps> = ({ product }) => {
    useEffect(() => {
        if (!product) return;

        // Удаляем предыдущую разметку товара, если есть
        const existingScript = document.getElementById('product-schema');
        if (existingScript) {
            existingScript.remove();
        }

        // Определяем цену (со скидкой или обычную)
        const price = product.sale_price || product.price;
        const originalPrice = product.price;

        // Собираем изображения
        const images: string[] = [];
        if ('images' in product && product.images?.length > 0) {
            product.images.forEach(img => images.push(img.image));
        } else if (product.image) {
            images.push(product.image);
        }

        // Получаем описание (если есть)
        const description = 'description' in product ? product.description : null;

        // Получаем бренд/категорию
        const brand = product.categories?.length > 0 ? product.categories[0].name : undefined;

        // Формируем JSON-LD разметку
        const schema: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': product.name,
            'image': images,
            'offers': {
                '@type': 'Offer',
                'price': parseFloat(price).toFixed(2),
                'priceCurrency': 'RUB',
                'availability': 'https://schema.org/InStock',
                'url': window.location.href,
            },
        };

        // Добавляем описание, если есть
        if (description) {
            // Убираем HTML теги из описания
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
            if (cleanDescription) {
                schema['description'] = cleanDescription;
            }
        }

        // Добавляем бренд/категорию
        if (brand) {
            schema['brand'] = {
                '@type': 'Brand',
                'name': brand,
            };
        }

        // Добавляем размеры, если есть
        if (product.width || product.height) {
            const additionalProperty: Array<Record<string, string>> = [];
            if (product.height) {
                additionalProperty.push({
                    '@type': 'PropertyValue',
                    'name': 'Высота',
                    'value': `${product.height} см`,
                });
            }
            if (product.width) {
                additionalProperty.push({
                    '@type': 'PropertyValue',
                    'name': 'Ширина',
                    'value': `${product.width} см`,
                });
            }
            schema['additionalProperty'] = additionalProperty;
        }

        // Если есть скидка, добавляем информацию о старой цене
        if (product.sale_price && parseFloat(product.sale_price) < parseFloat(originalPrice)) {
            (schema['offers'] as Record<string, unknown>)['priceSpecification'] = {
                '@type': 'PriceSpecification',
                'price': parseFloat(price).toFixed(2),
                'priceCurrency': 'RUB',
            };
        }

        // Создаём и добавляем script в head
        const script = document.createElement('script');
        script.id = 'product-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        // Cleanup при размонтировании
        return () => {
            const scriptToRemove = document.getElementById('product-schema');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [product]);

    // Компонент ничего не рендерит визуально
    return null;
};

export default ProductSchema;


# API Documentation - React Frontend

## Структура API

```
api/
├── config/          # Конфигурация API
│   ├── apiConfig.ts    # Настройки и endpoints
│   └── apiClient.ts    # Axios клиент с interceptors
├── services/        # API сервисы
│   ├── settingsService.ts
│   ├── bannerService.ts
│   ├── categoryService.ts
│   ├── tagService.ts
│   ├── cityService.ts
│   ├── storeService.ts
│   ├── productService.ts
│   ├── authService.ts
│   ├── addressService.ts
│   ├── orderService.ts
│   └── index.ts
├── types/           # TypeScript типы
│   ├── common.ts
│   ├── settings.ts
│   ├── banner.ts
│   ├── category.ts
│   ├── tag.ts
│   ├── city.ts
│   ├── store.ts
│   ├── product.ts
│   ├── auth.ts
│   ├── address.ts
│   ├── order.ts
│   └── index.ts
├── utils/           # Утилиты
│   └── tokenManager.ts
└── index.ts         # Главный экспорт
```

## Использование

### 1. Прямое использование сервисов

```typescript
import { productService } from '@/api/services';

// Получить список товаров
const products = await productService.getProducts({
    city_id: 1,
    category_id: 2,
    on_sale: true
});

// Получить товар по ID
const product = await productService.getProduct(1);
```

### 2. Использование React Hooks

```typescript
import { useProducts, useProduct } from '@/hooks';

function ProductList() {
    const { products, loading, error } = useProducts({
        city_id: 1,
        category_id: 2
    });

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div>
            {products.map(product => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

### 3. Аутентификация

```typescript
import { useAuth } from '@/hooks';

function LoginForm() {
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({
                login: 'user@example.com',
                password: 'password'
            });
            // Успешный вход
        } catch (err) {
            // Обработка ошибки
        }
    };

    return <form onSubmit={handleSubmit}>...</form>;
}
```

## Доступные хуки

- `useSettings()` - Настройки сайта
- `useBanners(params?)` - Баннеры
- `useCategories(params?)` - Категории
- `useProducts(params?)` - Список товаров
- `useProduct(id)` - Один товар
- `useAuth()` - Аутентификация
- `useOrders()` - Заказы
- `useOrder(id)` - Один заказ
- `usePromoCode()` - Промокоды
- `useDeliveryCalculation()` - Расчет доставки

## Примеры

См. файл `EXAMPLES.md` для подробных примеров использования.


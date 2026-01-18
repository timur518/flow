# React Quick Start Guide

## 🚀 Быстрый старт

### 1. Установка зависимостей (уже выполнено)

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

### 3. Сборка для продакшена

```bash
npm run build
```

### 4. Доступ к приложению

Откройте в браузере:
```
http://localhost/react
```

## 📁 Структура проекта

```
resources/react/
├── api/              # API интеграция
│   ├── config/      # Конфигурация
│   ├── services/    # API сервисы
│   ├── types/       # TypeScript типы
│   └── utils/       # Утилиты
├── hooks/           # React хуки
├── components/      # React компоненты (пусто, для будущего)
├── pages/           # Страницы (пусто, для будущего)
├── App.tsx          # Главный компонент
└── main.tsx         # Точка входа
```

## 🎯 Основные возможности

### ✅ Готово к использованию

1. **API клиент** - Настроенный Axios с interceptors
2. **TypeScript типы** - Полная типизация всех API
3. **React хуки** - Удобные хуки для работы с API
4. **Аутентификация** - Автоматическое управление токенами
5. **Обработка ошибок** - Централизованная обработка

### 📚 Доступные хуки

```typescript
import {
    useSettings,      // Настройки сайта
    useBanners,       // Баннеры
    useCategories,    // Категории
    useProducts,      // Товары (список)
    useProduct,       // Товар (один)
    useAuth,          // Аутентификация
    useOrders,        // Заказы
    usePromoCode,     // Промокоды
} from '@/hooks';
```

## 💡 Примеры использования

### Получение товаров

```typescript
import { useProducts } from '@/hooks';

function ProductList() {
    const { products, loading, error } = useProducts({
        category_id: 1,
        on_sale: true
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

### Аутентификация

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

### Создание заказа

```typescript
import { useOrders } from '@/hooks';

function Checkout() {
    const { createOrder, loading } = useOrders();

    const handleCheckout = async () => {
        try {
            const result = await createOrder({
                store_id: 1,
                delivery_date: '2024-01-15',
                delivery_time: '14:00',
                items: [
                    { product_id: 1, quantity: 2 }
                ],
                // ... другие поля
            });

            if (result.payment_url) {
                window.location.href = result.payment_url;
            }
        } catch (err) {
            alert('Ошибка создания заказа');
        }
    };

    return <button onClick={handleCheckout}>Оформить заказ</button>;
}
```

## 📖 Документация

- **Полная документация**: `REACT_INTEGRATION.md`
- **API документация**: `resources/react/api/README.md`
- **Примеры**: `resources/react/api/EXAMPLES.md`

## 🔧 Настройка

### Изменение базового URL API

Отредактируйте `resources/react/api/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
    BASE_URL: '/api/v1',  // Измените здесь
    TIMEOUT: 30000,
};
```

### Добавление нового сервиса

1. Создайте файл в `resources/react/api/services/`
2. Добавьте типы в `resources/react/api/types/`
3. Экспортируйте в `resources/react/api/services/index.ts`
4. Создайте хук в `resources/react/hooks/`

## 🎨 Стилизация

Проект использует **Tailwind CSS**. Все классы доступны из коробки.

## 🚨 Важно

- Токены хранятся в localStorage
- При 401 ошибке происходит автоматический редирект на /login
- Все запросы автоматически включают токен аутентификации

## 📝 Следующие шаги

1. Создайте компоненты в `resources/react/components/`
2. Добавьте страницы в `resources/react/pages/`
3. Настройте роутинг (React Router)
4. Добавьте state management (если нужно)


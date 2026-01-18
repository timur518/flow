# Примеры использования API

## 1. Получение настроек сайта

```typescript
import { useSettings } from '@/hooks';

function App() {
    const { settings, loading, error } = useSettings();

    useEffect(() => {
        if (settings) {
            // Применить цвета
            document.documentElement.style.setProperty('--primary-color', settings.appearance.primary_color);
            
            // Установить title
            document.title = settings.seo.home_title || 'Цветочный магазин';
        }
    }, [settings]);

    return <div>...</div>;
}
```

## 2. Отображение баннеров

```typescript
import { useBanners } from '@/hooks';

function BannerSlider({ cityId }: { cityId?: number }) {
    const { banners, loading } = useBanners({ city_id: cityId });

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="banner-slider">
            {banners.map(banner => (
                <img key={banner.id} src={banner.image} alt={banner.name} />
            ))}
        </div>
    );
}
```

## 3. Каталог товаров с фильтрацией

```typescript
import { useState } from 'react';
import { useProducts } from '@/hooks';

function ProductCatalog() {
    const [filters, setFilters] = useState({
        category_id: undefined,
        on_sale: false,
        search: ''
    });

    const { products, loading, error, refetch } = useProducts(filters);

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    return (
        <div>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Поиск..."
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                <label>
                    <input
                        type="checkbox"
                        onChange={(e) => handleFilterChange({ on_sale: e.target.checked })}
                    />
                    Только со скидкой
                </label>
            </div>

            {loading && <div>Загрузка...</div>}
            {error && <div>Ошибка: {error}</div>}

            <div className="products-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
```

## 4. Страница товара

```typescript
import { useProduct } from '@/hooks';
import { useParams } from 'react-router-dom';

function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { product, loading, error } = useProduct(Number(id));

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!product) return <div>Товар не найден</div>;

    return (
        <div className="product-page">
            <div className="product-images">
                {product.images.map(img => (
                    <img key={img.id} src={img.image} alt={product.name} />
                ))}
            </div>

            <div className="product-info">
                <h1>{product.name}</h1>
                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                
                <div className="price">
                    {product.sale_price ? (
                        <>
                            <span className="old-price">{product.price} ₽</span>
                            <span className="sale-price">{product.sale_price} ₽</span>
                        </>
                    ) : (
                        <span>{product.price} ₽</span>
                    )}
                </div>

                <div className="ingredients">
                    <h3>Состав:</h3>
                    <ul>
                        {product.ingredients.map(ing => (
                            <li key={ing.id}>{ing.name} - {ing.quantity} шт.</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
```

## 5. Авторизация

```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const { login: loginUser, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await loginUser({ login, password });
            navigate('/profile');
        } catch (err) {
            // Ошибка уже в state
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Email или телефон"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
}
```

## 6. Создание заказа

```typescript
import { useState } from 'react';
import { useOrders, usePromoCode, useDeliveryCalculation } from '@/hooks';

function CheckoutPage() {
    const { createOrder, loading } = useOrders();
    const { validatePromoCode } = usePromoCode();
    const { calculateDelivery } = useDeliveryCalculation();
    
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const handlePromoCode = async () => {
        const result = await validatePromoCode({ code: promoCode });
        if (result?.valid) {
            setDiscount(Number(result.discount_value));
        }
    };

    const handleSubmit = async (orderData) => {
        try {
            const result = await createOrder({
                ...orderData,
                promo_code: promoCode || undefined
            });

            if (result.payment_url) {
                // Редирект на оплату
                window.location.href = result.payment_url;
            } else {
                // Заказ создан
                alert('Заказ успешно создан!');
            }
        } catch (err) {
            alert('Ошибка создания заказа');
        }
    };

    return <div>...</div>;
}
```


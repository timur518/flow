# API Документация

## Базовый URL
```
http://your-domain.com/api/v1
```

## Оглавление
1. [Получить настройки сайта](#1-получить-настройки-сайта) - `GET /settings`
2. [Получить список баннеров](#2-получить-список-баннеров) - `GET /banners`
3. [Получить список категорий](#3-получить-список-категорий) - `GET /categories`
4. [Получить список тегов](#4-получить-список-тегов) - `GET /tags`
5. [Получить список городов](#5-получить-список-городов) - `GET /cities`
6. [Получить список магазинов](#6-получить-список-магазинов) - `GET /stores`
7. [Получить информацию о магазине](#7-получить-информацию-о-магазине) - `GET /stores/{id}`
8. [Получить периоды доставки магазина](#8-получить-периоды-доставки-магазина) - `GET /stores/{id}/delivery-periods`
9. [Получить зоны доставки магазина](#9-получить-зоны-доставки-магазина) - `GET /stores/{id}/delivery-zones`
10. [Получить список товаров](#10-получить-список-товаров) - `GET /products`
11. [Получить информацию о товаре](#11-получить-информацию-о-товаре) - `GET /products/{id}`

## Endpoints

### 1. Получить настройки сайта

**Endpoint:** `GET /settings`

**Описание:** Возвращает настройки сайта для фронтенда, включая внешний вид (логотип, favicon, цвета) и SEO настройки (title, description, метрика, скрипты).

**Параметры запроса:** Нет

**Пример запроса:**
```bash
curl http://127.0.0.1:8000/api/v1/settings
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "site_brand": "Цветочный магазин",
    "site_domain": "https://flowers.example.com",
    "appearance": {
      "logo_url": "http://127.0.0.1:8000/storage/logo.png",
      "favicon_url": "http://127.0.0.1:8000/storage/favicon.ico",
      "primary_color": "#ff6b9d",
      "secondary_color": "#c44569"
    },
    "seo": {
      "home_title": "Доставка цветов - Цветочный магазин",
      "home_description": "Свежие цветы с доставкой по городу. Большой выбор букетов на любой вкус.",
      "yandex_metrika_code": "<!-- Yandex.Metrika counter -->...",
      "custom_head_scripts": "<script>console.log('Custom script');</script>"
    }
  }
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (object) - настройки сайта
  - `site_brand` (string|null) - название бренда/сайта
  - `site_domain` (string|null) - домен сайта
  - `appearance` (object) - настройки внешнего вида
    - `logo_url` (string|null) - полный URL логотипа
    - `favicon_url` (string|null) - полный URL favicon
    - `primary_color` (string|null) - основной цвет в формате HEX
    - `secondary_color` (string|null) - дополнительный цвет в формате HEX
  - `seo` (object) - SEO настройки
    - `home_title` (string|null) - заголовок главной страницы (meta title)
    - `home_description` (string|null) - описание главной страницы (meta description)
    - `yandex_metrika_code` (string|null) - код Яндекс.Метрики
    - `custom_head_scripts` (string|null) - дополнительные скрипты для вставки в `<head>`

**Коды ответа:**
- `200 OK` - успешный запрос

**Применение:**
Этот endpoint используется для:
- Загрузки настроек сайта при инициализации React-приложения
- Применения брендинга (логотип, цвета) на фронтенде
- Настройки SEO (title, description) для главной страницы
- Подключения аналитики (Яндекс.Метрика)
- Добавления пользовательских скриптов в `<head>`

**Примечание:**
Если настройки не заданы в админ-панели, все поля будут `null`. Фронтенд должен корректно обрабатывать отсутствие значений.

---

### 2. Получить список баннеров

**Endpoint:** `GET /banners`

**Описание:** Возвращает список активных баннеров. Баннеры фильтруются по дате показа (текущая дата должна быть в пределах start_date и end_date) и статусу активности.

**Параметры запроса:**
- `city_id` (integer, optional) - ID города для фильтрации баннеров. Если указан, вернутся баннеры для этого города и баннеры для всех городов (city_id = null)

**Пример запроса:**
```bash
# Все активные баннеры
curl http://127.0.0.1:8000/api/v1/banners

# Баннеры для конкретного города
curl http://127.0.0.1:8000/api/v1/banners?city_id=1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "image": "http://127.0.0.1:8000/storage/banners/01KCXPR5Z8SXMNKEQDKYRNQS9D.JPG",
      "name": "Тестовый баннер",
      "city_id": 1,
      "sort_order": 1
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив баннеров
  - `id` (integer) - ID баннера
  - `image` (string) - полный URL изображения баннера
  - `name` (string) - название баннера (для идентификации)
  - `city_id` (integer|null) - ID города (null = для всех городов)
  - `sort_order` (integer) - порядок сортировки

**Коды ответа:**
- `200 OK` - успешный запрос

**Логика фильтрации:**
- Показываются только активные баннеры (`is_active = true`)
- Текущая дата >= `start_date` (или `start_date` не указана)
- Текущая дата <= `end_date` (или `end_date` не указана)
- При указании `city_id` возвращаются баннеры для этого города + баннеры для всех городов

---

### 3. Получить список категорий

**Endpoint:** `GET /categories`

**Описание:** Возвращает список категорий, отсортированных по порядку сортировки и названию. По умолчанию возвращает только активные категории.

**Параметры запроса:**
- `include_inactive` (boolean, optional) - включить неактивные категории. По умолчанию `false`.

**Примеры запросов:**

Получить только активные категории:
```bash
curl http://127.0.0.1:8000/api/v1/categories
```

Получить все категории (включая неактивные):
```bash
curl http://127.0.0.1:8000/api/v1/categories?include_inactive=1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Букеты",
      "slug": "bukety",
      "image": "http://127.0.0.1:8000/storage/categories/image.png",
      "sort_order": 0,
      "is_active": true
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив категорий
  - `id` (integer) - ID категории
  - `name` (string) - название категории
  - `slug` (string) - URL-friendly идентификатор
  - `image` (string|null) - полный URL изображения категории или null
  - `sort_order` (integer) - порядок сортировки
  - `is_active` (boolean) - активна ли категория

**Коды ответа:**
- `200 OK` - успешный запрос


---

### 4. Получить список тегов

**Endpoint:** `GET /tags`

**Описание:** Возвращает список тегов, отсортированных по порядку сортировки и названию. По умолчанию возвращает только активные теги.

**Параметры запроса:**
- `include_inactive` (boolean, optional) - включить неактивные теги. По умолчанию `false`.

**Примеры запросов:**

Получить только активные теги:
```bash
curl http://127.0.0.1:8000/api/v1/tags
```

Получить все теги (включая неактивные):
```bash
curl http://127.0.0.1:8000/api/v1/tags?include_inactive=1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Новинка",
      "color": "#ff0000",
      "sort_order": 0,
      "is_active": true
    },
    {
      "id": 2,
      "name": "Хит продаж",
      "color": "#00ff00",
      "sort_order": 1,
      "is_active": true
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив тегов
  - `id` (integer) - ID тега
  - `name` (string) - название тега
  - `color` (string) - цвет тега в формате HEX (#RRGGBB)
  - `sort_order` (integer) - порядок сортировки
  - `is_active` (boolean) - активен ли тег

**Коды ответа:**
- `200 OK` - успешный запрос

---

### 5. Получить список городов

**Endpoint:** `GET /cities`

**Описание:** Возвращает список активных городов, отсортированных по порядку сортировки и названию.

**Параметры запроса:** Нет

**Пример запроса:**
```bash
curl http://127.0.0.1:8000/api/v1/cities
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Москва",
      "latitude": "55.7558260",
      "longitude": "37.6173000",
      "sort_order": 0
    },
    {
      "id": 2,
      "name": "Санкт-Петербург",
      "latitude": "59.9342800",
      "longitude": "30.3350900",
      "sort_order": 1
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив городов
  - `id` (integer) - ID города
  - `name` (string) - название города
  - `latitude` (string|null) - широта
  - `longitude` (string|null) - долгота
  - `sort_order` (integer) - порядок сортировки

**Коды ответа:**
- `200 OK` - успешный запрос

---

### 6. Получить список магазинов

**Endpoint:** `GET /stores`

**Описание:** Возвращает список активных магазинов, отсортированных по порядку сортировки. Можно фильтровать по городу.

**Параметры запроса:**
- `city_id` (integer, optional) - фильтр по ID города

**Примеры запросов:**

Получить все магазины:
```bash
curl http://127.0.0.1:8000/api/v1/stores
```

Получить магазины в конкретном городе:
```bash
curl http://127.0.0.1:8000/api/v1/stores?city_id=1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "city": {
        "id": 1,
        "name": "Москва"
      },
      "address": "ул. Примерная, д. 1",
      "phone": "+7 (999) 123-45-67",
      "email": "store@example.com",
      "latitude": "55.7558260",
      "longitude": "37.6173000",
      "yandex_maps_url": "https://yandex.ru/maps/...",
      "social_links": {
        "whatsapp": "https://wa.me/...",
        "telegram_chat": "https://t.me/...",
        "telegram_channel": "https://t.me/...",
        "max_chat": "https://max.chat/...",
        "max_group": "https://max.group/...",
        "instagram": "https://instagram.com/...",
        "vk": "https://vk.com/..."
      },
      "sort_order": 0
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив магазинов
  - `id` (integer) - ID магазина
  - `city` (object) - информация о городе
    - `id` (integer) - ID города
    - `name` (string) - название города
  - `address` (string) - адрес магазина
  - `phone` (string|null) - телефон
  - `email` (string|null) - email
  - `latitude` (string|null) - широта
  - `longitude` (string|null) - долгота
  - `yandex_maps_url` (string|null) - ссылка на Яндекс.Карты
  - `social_links` (object) - ссылки на социальные сети
    - `whatsapp` (string|null) - WhatsApp
    - `telegram_chat` (string|null) - Telegram чат
    - `telegram_channel` (string|null) - Telegram канал
    - `max_chat` (string|null) - MAX чат
    - `max_group` (string|null) - MAX группа
    - `instagram` (string|null) - Instagram
    - `vk` (string|null) - VK
  - `sort_order` (integer) - порядок сортировки

**Коды ответа:**
- `200 OK` - успешный запрос

---

### 7. Получить информацию о магазине

**Endpoint:** `GET /stores/{id}`

**Описание:** Возвращает подробную информацию об активном магазине, включая периоды доставки и зоны доставки.

**Параметры пути:**
- `id` (integer, required) - ID магазина

**Пример запроса:**
```bash
curl http://127.0.0.1:8000/api/v1/stores/1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "city": {
      "id": 1,
      "name": "Москва"
    },
    "address": "ул. Примерная, д. 1",
    "phone": "+7 (999) 123-45-67",
    "email": "store@example.com",
    "latitude": "55.7558260",
    "longitude": "37.6173000",
    "yandex_maps_url": "https://yandex.ru/maps/...",
    "yandex_maps_code": "<iframe src='...'></iframe>",
    "social_links": {
      "whatsapp": "https://wa.me/...",
      "telegram_chat": "https://t.me/...",
      "telegram_channel": "https://t.me/...",
      "telegram_chat_id": "@chatid",
      "max_chat": "https://max.chat/...",
      "max_group": "https://max.group/...",
      "instagram": "https://instagram.com/...",
      "vk": "https://vk.com/..."
    },
    "legal_info": {
      "legal_name": "ООО \"Цветы\"",
      "inn": "1234567890",
      "ogrn": "1234567890123",
      "legal_address": "г. Москва, ул. Юридическая, д. 1"
    },
    "payment_settings": {
      "orders_blocked": false,
      "payment_on_delivery": true,
      "payment_online": true
    },
    "delivery_periods": [
      {
        "id": 1,
        "time_range": "10:00-12:00",
        "sort_order": 0
      },
      {
        "id": 2,
        "time_range": "12:00-14:00",
        "sort_order": 1
      }
    ],
    "delivery_zones": [
      {
        "id": 1,
        "name": "Центр",
        "polygon_coordinates": [[55.7558, 37.6173], [55.7559, 37.6174]],
        "delivery_cost": "500.00",
        "min_free_delivery_amount": "3000.00",
        "sort_order": 0
      }
    ]
  }
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (object) - информация о магазине
  - `id` (integer) - ID магазина
  - `city` (object) - информация о городе
    - `id` (integer) - ID города
    - `name` (string) - название города
  - `address` (string) - адрес магазина
  - `phone` (string|null) - телефон
  - `email` (string|null) - email
  - `latitude` (string|null) - широта
  - `longitude` (string|null) - долгота
  - `yandex_maps_url` (string|null) - ссылка на Яндекс.Карты
  - `yandex_maps_code` (string|null) - код для встраивания карты
  - `social_links` (object) - ссылки на социальные сети
    - `whatsapp` (string|null) - WhatsApp
    - `telegram_chat` (string|null) - Telegram чат
    - `telegram_channel` (string|null) - Telegram канал
    - `telegram_chat_id` (string|null) - Telegram chat ID
    - `max_chat` (string|null) - MAX чат
    - `max_group` (string|null) - MAX группа
    - `instagram` (string|null) - Instagram
    - `vk` (string|null) - VK
  - `legal_info` (object) - юридическая информация
    - `legal_name` (string|null) - юридическое название
    - `inn` (string|null) - ИНН
    - `ogrn` (string|null) - ОГРН
    - `legal_address` (string|null) - юридический адрес
  - `payment_settings` (object) - настройки оплаты
    - `orders_blocked` (boolean) - заблокированы ли заказы
    - `payment_on_delivery` (boolean) - доступна ли оплата при получении
    - `payment_online` (boolean) - доступна ли онлайн оплата
  - `delivery_periods` (array) - периоды доставки
    - `id` (integer) - ID периода
    - `time_range` (string) - временной диапазон
    - `sort_order` (integer) - порядок сортировки
  - `delivery_zones` (array) - зоны доставки
    - `id` (integer) - ID зоны
    - `name` (string) - название зоны
    - `polygon_coordinates` (array) - координаты полигона
    - `delivery_cost` (string) - стоимость доставки
    - `min_free_delivery_amount` (string) - минимальная сумма для бесплатной доставки
    - `sort_order` (integer) - порядок сортировки

**Коды ответа:**
- `200 OK` - успешный запрос
- `404 Not Found` - магазин не найден или неактивен



---

### 8. Получить периоды доставки магазина

**Endpoint:** `GET /stores/{id}/delivery-periods`

**Описание:** Возвращает список периодов доставки для конкретного активного магазина. Используется для выбора времени доставки в корзине/оформлении заказа.

**Параметры пути:**
- `id` (integer, required) - ID магазина

**Пример запроса:**
```bash
curl http://127.0.0.1:8000/api/v1/stores/1/delivery-periods
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "time_range": "10:00-12:00",
      "sort_order": 0
    },
    {
      "id": 2,
      "time_range": "12:00-14:00",
      "sort_order": 1
    },
    {
      "id": 3,
      "time_range": "14:00-16:00",
      "sort_order": 2
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив периодов доставки
  - `id` (integer) - ID периода
  - `time_range` (string) - временной диапазон (например, "10:00-12:00")
  - `sort_order` (integer) - порядок сортировки

**Коды ответа:**
- `200 OK` - успешный запрос
- `404 Not Found` - магазин не найден или неактивен

**Применение:**
Этот endpoint оптимизирован для использования в процессе оформления заказа, когда пользователю нужно выбрать время доставки. Возвращает только необходимые данные без лишней информации о магазине.

---

### 9. Получить зоны доставки магазина

**Endpoint:** `GET /stores/{id}/delivery-zones`

**Описание:** Возвращает список зон доставки для конкретного активного магазина с координатами полигонов и стоимостью доставки. Используется для расчёта стоимости доставки по адресу.

**Параметры пути:**
- `id` (integer, required) - ID магазина

**Пример запроса:**
```bash
curl http://127.0.0.1:8000/api/v1/stores/1/delivery-zones
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Центр",
      "polygon_coordinates": [
        [55.7558, 37.6173],
        [55.7559, 37.6174],
        [55.7560, 37.6175]
      ],
      "delivery_cost": "300.00",
      "min_free_delivery_amount": "3000.00",
      "sort_order": 0
    },
    {
      "id": 2,
      "name": "Окраина",
      "polygon_coordinates": [
        [55.7458, 37.6073],
        [55.7459, 37.6074],
        [55.7460, 37.6075]
      ],
      "delivery_cost": "500.00",
      "min_free_delivery_amount": "5000.00",
      "sort_order": 1
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив зон доставки
  - `id` (integer) - ID зоны
  - `name` (string) - название зоны
  - `polygon_coordinates` (array|null) - массив координат полигона [[lat, lng], [lat, lng], ...]
  - `delivery_cost` (string) - стоимость доставки в этой зоне
  - `min_free_delivery_amount` (string) - минимальная сумма заказа для бесплатной доставки
  - `sort_order` (integer) - порядок сортировки

**Коды ответа:**
- `200 OK` - успешный запрос
- `404 Not Found` - магазин не найден или неактивен

**Применение:**
Этот endpoint оптимизирован для использования в процессе оформления заказа:
- Определение зоны доставки по координатам адреса пользователя
- Расчёт стоимости доставки
- Проверка возможности бесплатной доставки
- Отображение зон на карте

---

### 10. Получить список товаров

**Endpoint:** `GET /products`

**Описание:** Возвращает список активных товаров с поддержкой фильтрации и сортировки. Для каждого товара возвращается основная информация для отображения в карточке товара.

**Параметры запроса:**
- `city_id` (integer, optional) - фильтр по городу
- `category_id` (integer, optional) - фильтр по категории
- `tag_id` (integer, optional) - фильтр по тегу
- `search` (string, optional) - поиск по названию товара
- `on_sale` (boolean, optional) - только товары со скидкой (sale_price не null)
- `sort_by` (string, optional) - поле для сортировки: `sort_order` (по умолчанию), `price`, `name`, `created_at`
- `sort_order` (string, optional) - направление сортировки: `asc` (по умолчанию), `desc`

**Примеры запросов:**
```bash
# Все товары
curl http://127.0.0.1:8000/api/v1/products

# Товары для конкретного города
curl http://127.0.0.1:8000/api/v1/products?city_id=1

# Товары конкретной категории
curl http://127.0.0.1:8000/api/v1/products?category_id=1

# Товары с конкретным тегом
curl http://127.0.0.1:8000/api/v1/products?tag_id=2

# Только товары со скидкой
curl http://127.0.0.1:8000/api/v1/products?on_sale=1

# Поиск по названию
curl http://127.0.0.1:8000/api/v1/products?search=роза

# Сортировка по цене (по возрастанию)
curl http://127.0.0.1:8000/api/v1/products?sort_by=price&sort_order=asc

# Комбинированная фильтрация
curl http://127.0.0.1:8000/api/v1/products?city_id=1&category_id=1&on_sale=1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Букет из розовых роз",
      "price": "7500.00",
      "sale_price": "5000.00",
      "image": "http://127.0.0.1:8000/storage/products/01KCY6W2014QNKKS71YGG646VA.JPG",
      "width": 45,
      "height": 55,
      "categories": [
        {
          "id": 1,
          "name": "Букеты",
          "slug": "bukety"
        }
      ],
      "tags": [
        {
          "id": 2,
          "name": "Хит продаж",
          "color": "#ffb1c9"
        }
      ]
    }
  ]
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (array) - массив товаров
  - `id` (integer) - ID товара
  - `name` (string) - название товара
  - `price` (string) - обычная цена
  - `sale_price` (string|null) - акционная цена (если есть)
  - `image` (string|null) - URL первого изображения товара
  - `width` (integer|null) - ширина букета в см
  - `height` (integer|null) - высота букета в см
  - `categories` (array) - массив категорий товара
    - `id` (integer) - ID категории
    - `name` (string) - название категории
    - `slug` (string) - slug категории
  - `tags` (array) - массив тегов товара
    - `id` (integer) - ID тега
    - `name` (string) - название тега
    - `color` (string) - цвет тега в формате HEX

**Коды ответа:**
- `200 OK` - успешный запрос

**Применение:**
Этот endpoint используется для:
- Отображения каталога товаров
- Фильтрации товаров по различным критериям
- Поиска товаров
- Отображения товаров на главной странице
- Отображения товаров в категориях

---

### 11. Получить информацию о товаре

**Endpoint:** `GET /products/{id}`

**Описание:** Возвращает подробную информацию об активном товаре, включая все изображения, состав (ингредиенты), города доступности.

**Параметры пути:**
- `id` (integer, required) - ID товара

**Пример запроса:**
```bash
curl http://127.0.0.1:8000/api/v1/products/1
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Букет из розовых роз",
    "description": "<p>Красивый пышный букет из розовых роз</p>",
    "price": "7500.00",
    "sale_price": "5000.00",
    "width": 45,
    "height": 55,
    "categories": [
      {
        "id": 1,
        "name": "Букеты",
        "slug": "bukety"
      }
    ],
    "tags": [
      {
        "id": 2,
        "name": "Хит продаж",
        "color": "#ffb1c9"
      }
    ],
    "images": [
      {
        "id": 2,
        "image": "http://127.0.0.1:8000/storage/products/01KCY6W2014QNKKS71YGG646VA.JPG",
        "sort_order": 0
      }
    ],
    "cities": [
      {
        "id": 1,
        "name": "Белгород"
      }
    ],
    "ingredients": [
      {
        "id": 1,
        "name": "Роза красная",
        "quantity": 13
      },
      {
        "id": 7,
        "name": "Упаковка бумажная",
        "quantity": 1
      }
    ]
  }
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (object) - информация о товаре
  - `id` (integer) - ID товара
  - `name` (string) - название товара
  - `description` (string|null) - HTML-описание товара
  - `price` (string) - обычная цена
  - `sale_price` (string|null) - акционная цена (если есть)
  - `width` (integer|null) - ширина букета в см
  - `height` (integer|null) - высота букета в см
  - `categories` (array) - массив категорий товара
    - `id` (integer) - ID категории
    - `name` (string) - название категории
    - `slug` (string) - slug категории
  - `tags` (array) - массив тегов товара
    - `id` (integer) - ID тега
    - `name` (string) - название тега
    - `color` (string) - цвет тега в формате HEX
  - `images` (array) - массив всех изображений товара
    - `id` (integer) - ID изображения
    - `image` (string) - URL изображения
    - `sort_order` (integer) - порядок сортировки
  - `cities` (array) - массив городов, где доступен товар
    - `id` (integer) - ID города
    - `name` (string) - название города
  - `ingredients` (array) - состав товара (что входит в букет)
    - `id` (integer) - ID ингредиента
    - `name` (string) - название ингредиента
    - `quantity` (integer) - количество

**Коды ответа:**
- `200 OK` - успешный запрос
- `404 Not Found` - товар не найден или неактивен

**Применение:**
Этот endpoint используется для:
- Отображения страницы товара с полной информацией
- Показа всех фотографий товара в галерее
- Отображения состава букета
- Проверки доступности товара в конкретном городе



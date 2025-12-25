# API Документация - Заказы и Промокоды

## Оглавление

- [Базовая информация](#базовая-информация)
  - [Базовый URL](#базовый-url)
  - [Аутентификация](#аутентификация)
- [Endpoints для заказов](#endpoints-для-заказов)
  - [1. Получить список заказов](#1-получить-список-заказов)
  - [2. Получить детальную информацию о заказе](#2-получить-детальную-информацию-о-заказе)
  - [3. Рассчитать стоимость доставки](#3-рассчитать-стоимость-доставки)
  - [4. Создать заказ](#4-создать-заказ)
  - [5. Обновить статус оплаты заказа](#5-обновить-статус-оплаты-заказа)
  - [6. Webhook для YooKassa](#6-webhook-для-yookassa-заготовка)
- [Endpoints для промокодов](#endpoints-для-промокодов)
  - [7. Валидация промокода](#7-валидация-промокода)
- [Справочная информация](#справочная-информация)
  - [Статусы заказа](#статусы-заказа)
  - [Статусы оплаты](#статусы-оплаты)
  - [Типы оплаты](#типы-оплаты)
  - [Типы доставки](#типы-доставки)
  - [Типы промокодов](#типы-промокодов)
- [Интеграция с YooKassa](#интеграция-с-yookassa)
- [Примеры использования](#примеры-использования)

---

## Базовая информация

### Базовый URL
```
http://your-domain.com/api/v1
```

### Аутентификация

Все endpoints требуют токен аутентификации в заголовке (кроме webhook и валидации промокода):
```
Authorization: Bearer {token}
```

---

## Endpoints для заказов

### 1. Получить список заказов

**GET** `/orders`

Получить все заказы текущего пользователя.

**Заголовки:**
```
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "12345",
      "status": "new",
      "status_label": "Новый",
      "payment_type": "on_delivery",
      "payment_type_label": "При получении",
      "payment_status": "pending",
      "payment_status_label": "Ожидает оплаты",
      "payment_id": null,
      "payment_url": null,
      "promo_code": null,
      "courier": null,
      "user_id": 1,
      "customer_phone": "+79991234567",
      "is_anonymous": false,
      "user": {
        "id": 1,
        "name": "Иван Иванов",
        "email": "ivan@example.com",
        "phone": "+79991234567"
      },
      "recipient_name": "Петр Петров",
      "recipient_phone": "+79991111111",
      "recipient_social": null,
      "city_id": 1,
      "city": {
        "id": 1,
        "name": "Белгород"
      },
      "delivery_type": "delivery",
      "delivery_type_label": "Доставка",
      "delivery_address": "ул. Ленина, д. 10, кв. 25",
      "delivery_date": "2025-12-25",
      "delivery_time": "14:00-16:00",
      "subtotal": 10000.00,
      "discount": 0.00,
      "total": 10000.00,
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "Букет из розовых роз",
          "quantity": 2,
          "price": 5000.00,
          "total": 10000.00,
          "product": {
            "id": 1,
            "name": "Букет из розовых роз",
            "description": "<p>Красивый пышный букет из розовых роз</p>",
            "price": 7500.00,
            "sale_price": 5000.00,
            "width": 45,
            "height": 55,
            "is_active": true,
            "images": [
              {
                "id": 1,
                "url": "http://example.com/storage/products/image.jpg",
                "sort_order": 0
              }
            ]
          }
        }
      ],
      "created_at": "2025-12-24T12:00:00.000000Z",
      "updated_at": "2025-12-24T12:00:00.000000Z"
    }
  ]
}
```

---

### 2. Получить детальную информацию о заказе

**GET** `/orders/{id}`

Получить подробную информацию о конкретном заказе.

**Заголовки:**
```
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
    "order": {
        "id": 1,
        "order_number": "12345",
        "status": "new",
        "status_label": "Новый",
        "payment_type": "on_delivery",
        "payment_type_label": "При получении",
        "payment_status": "pending",
        "payment_status_label": "Ожидает оплаты",
        "payment_id": null,
        "payment_url": null,
        "promo_code": null,
        "courier": null,
        "user_id": 1,
        "customer_phone": "+79991234567",
        "is_anonymous": false,
        "user": {
            "id": 1,
            "name": "Иван Иванов",
            "email": "ivan@example.com",
            "phone": "+79991234567"
        },
        "recipient_name": "Петр Петров",
        "recipient_phone": "+79991111111",
        "recipient_social": null,
        "city_id": 1,
        "city": {
            "id": 1,
            "name": "Белгород"
        }
    }
}
```

**Ошибка (403):**
```json
{
  "message": "Доступ запрещен"
}
```

---

### 3. Рассчитать стоимость доставки

**Endpoint:** `POST /delivery/calculate`

**Описание:** Рассчитывает стоимость доставки по координатам адреса. Определяет зону доставки, в которую попадает адрес, и возвращает стоимость доставки с учетом минимальной суммы для бесплатной доставки.

**Параметры тела запроса:**
- `store_id` (integer, required) - ID магазина
- `latitude` (float, required) - широта адреса доставки (от -90 до 90)
- `longitude` (float, required) - долгота адреса доставки (от -180 до 180)
- `subtotal` (float, required) - сумма заказа (для расчета бесплатной доставки)

**Пример запроса:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "latitude": 55.7558,
    "longitude": 37.6173,
    "subtotal": 2500.00
  }'
```

**Пример успешного ответа:**
```json
{
  "success": true,
  "data": {
    "zone_id": 1,
    "zone_name": "Центр",
    "delivery_cost": 500.00,
    "is_free": false,
    "min_free_delivery_amount": 3000.00,
    "message": "До бесплатной доставки не хватает 500.00 ₽"
  },
  "message": null
}
```

**Пример ответа с бесплатной доставкой:**
```json
{
  "success": true,
  "data": {
    "zone_id": 1,
    "zone_name": "Центр",
    "delivery_cost": 0,
    "is_free": true,
    "min_free_delivery_amount": 3000.00,
    "message": null
  },
  "message": null
}
```

**Пример ответа, когда адрес вне зон доставки:**
```json
{
  "success": false,
  "data": null,
  "message": "К сожалению, доставка по указанному адресу недоступна"
}
```

**Поля ответа:**
- `success` (boolean) - статус выполнения запроса
- `data` (object|null) - данные о доставке (null если адрес вне зон доставки)
    - `zone_id` (integer) - ID зоны доставки
    - `zone_name` (string) - название зоны доставки
    - `delivery_cost` (float) - стоимость доставки (0 если бесплатная)
    - `is_free` (boolean) - бесплатная ли доставка
    - `min_free_delivery_amount` (float|null) - минимальная сумма для бесплатной доставки
    - `message` (string|null) - информационное сообщение (например, сколько не хватает до бесплатной доставки)
- `message` (string|null) - сообщение об ошибке (если success = false)

**Коды ответа:**
- `200 OK` - успешный расчет стоимости доставки
- `404 Not Found` - адрес находится вне зон доставки
- `422 Unprocessable Entity` - ошибка валидации параметров

**Применение:**
Этот endpoint используется в процессе оформления заказа:
- После того, как пользователь выбрал адрес доставки (через DaData получены координаты)
- Для отображения стоимости доставки в корзине/чекауте
- Для информирования пользователя о возможности бесплатной доставки
- Для валидации адреса перед созданием заказа

**Примечание:**
- Координаты адреса должны быть получены через DaData API при выборе адреса
- Расчет производится с помощью алгоритма Ray Casting для определения точки внутри полигона
- Если адрес попадает в несколько зон, выбирается первая по порядку сортировки (sort_order)

---

### 4. Создать заказ

**POST** `/orders`

Создать новый заказ.

**Заголовки:**
```
Authorization: Bearer {token}
```

**Тело запроса:**
```json
{
  "payment_type": "on_delivery",
  "promo_code": "SUMMER2025",
  "recipient_name": "Петр Петров",
  "recipient_phone": "+79991111111",
  "recipient_social": "https://vk.com/petr",
  "city_id": 1,
  "delivery_type": "delivery",
  "delivery_address": "ул. Ленина, д. 10, кв. 25",
  "delivery_date": "2025-12-25",
  "delivery_time": "14:00-16:00",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

**Обязательные поля:**
- `payment_type` - тип оплаты (`on_delivery` или `online`)
- `city_id` - ID города
- `delivery_type` - тип доставки (`delivery` или `pickup`)
- `delivery_address` - адрес доставки (обязателен если `delivery_type` = `delivery`)
- `delivery_date` - дата доставки (не может быть в прошлом)
- `delivery_time` - время доставки
- `items` - массив товаров (минимум 1 товар)
- `items.*.product_id` - ID товара
- `items.*.quantity` - количество (минимум 1)

**Опциональные поля:**
- `promo_code` - промокод
- `recipient_name` - ФИО получателя
- `recipient_phone` - телефон получателя
- `recipient_social` - ссылка на соц-сеть получателя

**Ответ (201) - Оплата при получении:**
```json
{
  "message": "Заказ создан успешно",
  "order": {
    "id": 1,
    "order_number": "12345",
    "status": "new",
    "payment_type": "on_delivery",
    "payment_status": "pending",
    "total": 10000.00
  }
}
```

**Ответ (201) - Онлайн оплата:**
```json
{
  "message": "Заказ создан. Ожидается интеграция с YooKassa для получения ссылки на оплату.",
  "order": {
    "id": 1,
    "order_number": "12345",
    "status": "new",
    "payment_type": "online",
    "payment_status": "pending",
    "payment_url": null,
    "total": 10000.00
  },
  "payment_url": null
}
```

**Примечание:** После интеграции с YooKassa, поле `payment_url` будет содержать ссылку на страницу оплаты.

**Ошибка (422):**
```json
{
  "message": "Ошибка валидации",
  "errors": {
    "items": ["Добавьте хотя бы один товар"],
    "delivery_date": ["Дата доставки не может быть в прошлом"]
  }
}
```

---

### 5. Обновить статус оплаты заказа

**POST** `/orders/{id}/update-status`

Обновить статус оплаты заказа. Этот endpoint используется для webhook YooKassa.

**Заголовки:**
```
Authorization: Bearer {token}
```

**Тело запроса:**
```json
{
  "payment_status": "succeeded",
  "payment_id": "2d8f5e7a-0001-5000-8000-1b2c3d4e5f6a"
}
```

**Параметры:**
- `payment_status` - статус оплаты (`pending`, `succeeded`, `cancelled`)
- `payment_id` - ID платежа в YooKassa (опционально)

**Ответ (200):**
```json
{
  "message": "Статус оплаты обновлен",
  "order": {
    "id": 1,
    "order_number": "12345",
    "status": "processing",
    "payment_status": "succeeded",
    "payment_id": "2d8f5e7a-0001-5000-8000-1b2c3d4e5f6a"
  }
}
```

**Примечание:**
- При статусе `succeeded` заказ автоматически переходит в статус `processing`
- При статусе `cancelled` заказ автоматически переходит в статус `cancelled`

---

### 6. Webhook для YooKassa (заготовка)

**POST** `/webhook/yookassa`

Обработка уведомлений от YooKassa о статусе платежа.

**Без аутентификации** (публичный endpoint, защищен проверкой IP YooKassa)

**Тело запроса:**
Формат определяется YooKassa API. Подробнее: https://yookassa.ru/developers/using-api/webhooks

**Ответ (200):**
```json
{
  "status": "ok"
}
```

**Примечание:**
- Этот endpoint является заготовкой для будущей интеграции с YooKassa
- Требуется настройка webhook URL в личном кабинете YooKassa
- Рекомендуется добавить проверку IP-адресов YooKassa для безопасности

---

## Endpoints для промокодов

### 7. Валидация промокода

**POST** `/promo-codes/validate`

Валидация промокода и расчет скидки для корзины. Этот endpoint используется фронтендом для отображения скидки пользователю **до** создания заказа.

**Без аутентификации** (публичный endpoint)

**Тело запроса:**
```json
{
  "code": "SUMMER2025",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

**Обязательные поля:**
- `code` - код промокода (строка, максимум 50 символов)
- `items` - массив товаров в корзине (минимум 1 товар)
- `items.*.product_id` - ID товара
- `items.*.quantity` - количество (минимум 1)

**Ответ (200) - Промокод валиден:**
```json
{
  "valid": true,
  "promo_code": {
    "code": "SUMMER2025",
    "discount_type": "percentage",
    "discount_value": 15
  },
  "calculation": {
    "subtotal": 10000.00,
    "discount": 1500.00,
    "total": 8500.00
  }
}
```

**Ответ (200) - Фиксированная скидка:**
```json
{
  "valid": true,
  "promo_code": {
    "code": "FIXED500",
    "discount_type": "fixed",
    "discount_value": 500
  },
  "calculation": {
    "subtotal": 5000.00,
    "discount": 500.00,
    "total": 4500.00
  }
}
```

**Ответ (422) - Промокод невалиден:**
```json
{
  "valid": false,
  "message": "Промокод не найден"
}
```

**Возможные сообщения об ошибках:**
- `Промокод не найден` - промокод не существует в базе
- `Промокод неактивен` - промокод отключен администратором
- `Промокод еще не действует` - дата начала действия в будущем
- `Срок действия промокода истек` - дата окончания в прошлом
- `Промокод исчерпан` - достигнут лимит использований
- `Промокод настроен некорректно` - не указана скидка

**Примечание:**
- Расчет на фронтенде используется **только для отображения**
- Реальный расчет и применение промокода происходит при создании заказа на бэкенде
- Это сделано для безопасности (фронтенд можно взломать)

---

## Справочная информация

### Статусы заказа

- `new` - Новый
- `processing` - В обработке
- `assembling` - Собирается
- `awaiting_delivery` - Ожидает доставку
- `delivering` - Доставляется
- `completed` - Завершен
- `cancelled` - Отменен

## Статусы оплаты

- `pending` - Ожидает оплаты
- `succeeded` - Оплачен
- `cancelled` - Отменен

## Типы оплаты

- `on_delivery` - При получении
- `online` - Онлайн оплата

## Типы доставки

- `delivery` - Доставка
- `pickup` - Самовывоз

### Типы промокодов

**По типу скидки:**
- `percentage` - Процентная скидка (например, 15%)
- `fixed` - Фиксированная скидка в рублях (например, 500 руб)

**Настройки промокода (в Filament админ-панели):**
- `code` - Уникальный код промокода (только английские буквы, цифры, дефис и подчёркивание)
- `discount_amount` - Фиксированная скидка в рублях (приоритет выше)
- `discount_percent` - Процентная скидка (0-100%)
- `usage_limit` - Лимит использований (null = неограниченно)
- `usage_count` - Счетчик использований (автоматически увеличивается)
- `valid_from` - Дата начала действия (опционально)
- `valid_until` - Дата окончания действия (опционально)
- `is_active` - Активность промокода

**Приоритет скидок:**
1. Если указана `discount_amount` - применяется фиксированная скидка
2. Если указана только `discount_percent` - применяется процентная скидка
3. Должна быть указана хотя бы одна из двух скидок

**Логика применения:**
- Промокод валидируется при создании заказа на бэкенде
- **Минимальная сумма заказа - 1 рубль** (требование законодательства и платежных систем)
- Скидка автоматически ограничивается так, чтобы итоговая сумма была не меньше 1 рубля
- Счетчик использований увеличивается только после успешного создания заказа
- Один промокод на заказ

---

## Примеры использования

### Создание заказа с доставкой

```bash
curl -X POST http://your-domain.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{
    "payment_type": "on_delivery",
    "recipient_name": "Петр Петров",
    "recipient_phone": "+79991111111",
    "city_id": 1,
    "delivery_type": "delivery",
    "delivery_address": "ул. Ленина, д. 10, кв. 25",
    "delivery_date": "2025-12-25",
    "delivery_time": "14:00-16:00",
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

### Создание заказа с самовывозом и онлайн оплатой

```bash
curl -X POST http://your-domain.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{
    "payment_type": "online",
    "city_id": 1,
    "delivery_type": "pickup",
    "delivery_date": "2025-12-26",
    "delivery_time": "10:00-12:00",
    "items": [
      {
        "product_id": 1,
        "quantity": 1
      }
    ]
  }'
```

### Валидация промокода перед созданием заказа

```bash
curl -X POST http://your-domain.com/api/v1/promo-codes/validate \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "code": "SUMMER2025",
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

**Ответ:**
```json
{
  "valid": true,
  "promo_code": {
    "code": "SUMMER2025",
    "discount_type": "percentage",
    "discount_value": 15
  },
  "calculation": {
    "subtotal": 10000.00,
    "discount": 1500.00,
    "total": 8500.00
  }
}
```

### Создание заказа с промокодом

```bash
curl -X POST http://your-domain.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{
    "payment_type": "on_delivery",
    "promo_code": "SUMMER2025",
    "recipient_name": "Петр Петров",
    "recipient_phone": "+79991111111",
    "city_id": 1,
    "delivery_type": "delivery",
    "delivery_address": "ул. Ленина, д. 10, кв. 25",
    "delivery_date": "2025-12-25",
    "delivery_time": "14:00-16:00",
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

### Пример с промокодом, превышающим сумму заказа

Если промокод дает скидку больше стоимости заказа, итоговая сумма будет 1 рубль:

```bash
curl -X POST http://your-domain.com/api/v1/promo-codes/validate \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "code": "MEGA10000",
    "items": [
      {
        "product_id": 1,
        "quantity": 1
      }
    ]
  }'
```

**Ответ (товар стоит 5000 руб, промокод на 10000 руб):**
```json
{
  "valid": true,
  "promo_code": {
    "code": "MEGA10000",
    "discount_type": "fixed",
    "discount_value": 10000
  },
  "calculation": {
    "subtotal": 5000.00,
    "discount": 4999.00,
    "total": 1.00
  }
}
```

**Обратите внимание:** Скидка автоматически ограничена до 4999 руб, чтобы итоговая сумма была минимум 1 рубль.


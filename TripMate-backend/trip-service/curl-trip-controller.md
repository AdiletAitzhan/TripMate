# cURL примеры для TripController

Базовый URL: `http://localhost:8085`  
Все эндпоинты (кроме `/test`) требуют JWT в заголовке: `Authorization: Bearer <token>`

---

## 1. Тест (без авторизации)

```bash
curl -s http://localhost:8085/api/trip-requests/test
```

---

## 2. Создать заявку на поездку

**POST** `/api/trip-requests`

```bash
curl -s -X POST http://localhost:8085/api/trip-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "destination": {
      "city": "Barcelona",
      "country": "Spain",
      "countryCode": "ES"
    },
    "startDate": "2025-06-01",
    "endDate": "2025-06-15",
    "flexibleDates": false,
    "budget": {
      "amount": 1500,
      "currency": "EUR"
    },
    "preferences": {
      "mustHave": {
        "ageRange": { "min": 25, "max": 40 },
        "gender": ["any"],
        "verifiedOnly": true
      },
      "niceToHave": {
        "similarInterests": "high",
        "similarBudget": "medium"
      }
    },
    "notifyOnMatch": true
  }'
```

Минимальный body (только обязательные поля):

```bash
curl -s -X POST http://localhost:8085/api/trip-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "destination": { "city": "Paris", "country": "France", "countryCode": "FR" },
    "startDate": "2025-07-01",
    "endDate": "2025-07-10"
  }'
```

---

## 3. Мои заявки (с пагинацией и фильтром по статусу)

**GET** `/api/trip-requests/me`

```bash
# Все заявки, страница 1, по 10 записей
curl -s "http://localhost:8085/api/trip-requests/me?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# С фильтром по статусу
curl -s "http://localhost:8085/api/trip-requests/me?status=PENDING&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Получить заявку по ID

**GET** `/api/trip-requests/{requestId}`

```bash
curl -s "http://localhost:8085/api/trip-requests/REQUEST_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Пример с конкретным UUID:

```bash
curl -s "http://localhost:8085/api/trip-requests/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Обновить заявку

**PUT** `/api/trip-requests/{requestId}`

```bash
curl -s -X PUT "http://localhost:8085/api/trip-requests/REQUEST_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "startDate": "2025-06-10",
    "endDate": "2025-06-20",
    "budget": { "amount": 2000, "currency": "EUR" }
  }'
```

Все поля в body опциональны — можно передать только те, что меняются.

---

## 6. Удалить заявку

**DELETE** `/api/trip-requests/{requestId}`

```bash
curl -s -X DELETE "http://localhost:8085/api/trip-requests/REQUEST_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Как получить JWT

Токен берётся из Keycloak (по конфигу: `http://localhost:8080/realms/tripmate`). Пример получения токена через password grant:

```bash
curl -s -X POST "http://localhost:8080/realms/tripmate/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD"
```

В ответе использовать поле `access_token` как `YOUR_JWT_TOKEN`.

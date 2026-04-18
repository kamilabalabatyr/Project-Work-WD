# RentEase — аренда жилья

Учебный проект: клон AirBNB для аренды квартир и домов. Гости бронируют жильё, арендодатели выставляют объявления, админ модерирует.

## Команда
- **Демченко Александр** — бэкенд (Django, DRF, модели, авторизация, роли, approval workflow, коллизии дат)
- **Шамриков Денис** — бэкенд (Booking, Review, сериализаторы, Postman)
- **Балабатырь Камила** — фронтенд (Angular 21, страницы, сервисы, interceptor, guard)

## Стек
- **Backend:** Django 4.2 + DRF, TokenAuthentication, SQLite, django-cors-headers
- **Frontend:** Angular 21, RxJS, SCSS
- **Инфра:** Docker (опционально), .env для секретов

---

## Как запустить

### Бэкенд
```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Нужен файл `backend/.env`:
```
SECRET_KEY=какой-нибудь-секрет
DEBUG=True
```

### Фронтенд
```bash
cd rentease-frontend
npm install
ng serve
```
Откроется на `http://localhost:4200`, прокси уже настроен на бэк.

---

## API Documentation

Базовый URL: `http://localhost:8000/api/`

Все защищённые запросы требуют заголовок:
```
Authorization: Token <ваш_токен>
```

Ответы со списками обёрнуты в пагинацию (PageNumberPagination, 20 записей на страницу):
```json
{ "count": 42, "next": "...", "previous": null, "results": [ ... ] }
```

### Роли
У каждого пользователя одна из трёх ролей: `guest`, `landlord`, `admin`. Роль выбирается при регистрации (по умолчанию `guest`). От роли зависит, что человек может делать — гость бронирует, арендодатель создаёт объявления, админ их модерирует.

---

### 🔐 Авторизация

#### `POST /api/auth/register/`
Регистрация. Можно сразу стать арендодателем — укажите `role: "landlord"`.

**Лимит:** 5 запросов в минуту.

**Запрос:**
```json
{
  "username": "alex",
  "email": "alex@mail.com",
  "password": "StrongPass123",
  "password2": "StrongPass123",
  "role": "landlord"
}
```
**Ответ 201:**
```json
{
  "token": "8f2c...",
  "user_id": 7,
  "username": "alex",
  "role": "landlord"
}
```

#### `POST /api/auth/login/`
Вход по логину/паролю, в ответе приходит токен и роль.

**Лимит:** 5 запросов в минуту.

**Запрос:**
```json
{ "username": "alex", "password": "StrongPass123" }
```
**Ответ 200:**
```json
{ "token": "8f2c...", "user_id": 7, "username": "alex", "role": "landlord" }
```

#### `POST /api/auth/logout/`
Удаляет токен с сервера. Требует авторизации.

**Ответ 200:** `{ "detail": "Logged out." }`

---

### 🏡 Объявления (Properties)

#### `GET /api/properties/`
Список объявлений. Что увидит человек — зависит от роли:
- гость/аноним — только одобренные (`status=approved`)
- арендодатель — все одобренные + все свои (в любом статусе)
- админ — всё подряд

**Ответ 200:** пагинированный список.

#### `POST /api/properties/`
Создаёт объявление. Доступно **только арендодателям**. Объявление сразу уходит в статус `pending` и ждёт модерации.

**Запрос:**
```json
{
  "title": "Квартира в центре",
  "description": "Две комнаты, рядом метро",
  "city": "Алматы",
  "price_per_night": "45.00",
  "max_guests": 4,
  "images": []
}
```
**Ответ 201:** объект property с `status: "pending"`.
**Ответ 403:** если роль — `guest`.

#### `GET /api/properties/<id>/`
Детали одного объявления.

#### `PUT` / `PATCH /api/properties/<id>/`
Обновить объявление. Только владелец.

#### `DELETE /api/properties/<id>/`
Удалить объявление. Только владелец.

---

### 👮 Модерация (только админ)

#### `GET /api/admin/properties/pending/`
Список объявлений, ждущих одобрения.

#### `POST /api/admin/properties/<id>/approval/`
Одобрить или отклонить объявление.

**Запрос на одобрение:**
```json
{ "action": "approve" }
```
**Запрос на отказ (причина обязательна):**
```json
{ "action": "reject", "rejection_reason": "Фото не соответствуют описанию" }
```
**Ответ 200:** обновлённый объект property.

---

### 🧑‍💼 Кабинет арендодателя

#### `GET /api/landlord/properties/`
Все свои объявления (любого статуса).

#### `GET /api/landlord/properties/<id>/bookings/`
Брони на конкретное своё объявление — кто, когда, сколько гостей.

#### `GET /api/landlord/bookings/`
Все брони на все свои объявления — общий список.

---

### 📅 Бронирования

#### `POST /api/bookings/`
Забронировать жильё. Работает только для `approved` объявлений.

**Запрос:**
```json
{
  "property": 3,
  "check_in": "2026-05-01",
  "check_out": "2026-05-05",
  "guests_count": 2
}
```
**Ответ 201:** бронь с рассчитанным `total_price` (цена за ночь × количество ночей).

**Валидация:**
- `check_out > check_in`
- `check_in` не в прошлом
- гостей — не больше `max_guests` объявления
- объявление одобрено
- **нет пересечения с другими бронями** — если даты пересекаются хотя бы на одну ночь, вернётся 400 с сообщением «This property is already booked for the selected dates.». Смежные даты (выезд одного = заезд другого) разрешены.

#### `GET /api/bookings/`
Мои брони (только свои, чужие не показываются).

#### `GET /api/bookings/<id>/`
Детали брони.

#### `DELETE /api/bookings/<id>/`
Отменить бронь. Только свою.

---

## Коды ответов

- **200** — ок
- **201** — создано
- **400** — плохой запрос или провалена валидация
- **401** — нет токена или токен невалидный
- **403** — нет прав (не та роль / не владелец)
- **404** — не найдено
- **429** — сработал rate limit

## Лимиты (rate limiting)
- анонимные запросы: 30/мин
- залогиненный пользователь: 100/мин
- `/auth/register/` и `/auth/login/`: 5/мин (чтобы не брутфорсили пароли)

---

## Тесты и Postman
В корне репо лежит `postman_collection.json` — импортируется в Postman, там все эндпоинты с примерами.

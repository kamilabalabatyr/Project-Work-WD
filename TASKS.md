# 📋 RentEase — Task Board
> Тема: AirBNB-клон (аренда жилья) · Django + DRF / Angular

---

## 👥 Команда и роли

| Имя | Роль | Стек | Зона ответственности |
|-----|------|------|----------------------|
| **Саша** | Backend Dev | Django + DRF | Models, Auth, Property CRUD, CORS |
| **Денис** | Backend Dev | Django + DRF | Booking, Review, Serializers, Postman |
| **Камила** | Frontend Dev | Angular | Все страницы, сервисы, формы, JWT |

---

## 🔴 Саша — Backend

### Фаза 1: Инициализация проекта (День 1–2)
- [+] Создать GitHub репо, добавить всех в коллаборы
- [+] Инициализировать Django проект: `django-admin startproject rentease`
- [+] Создать приложение: `python manage.py startapp api`
- [+] Настроить `settings.py`: `INSTALLED_APPS`, `DATABASES`, `REST_FRAMEWORK`
- [+] Настроить `django-cors-headers` (добавить в MIDDLEWARE, `CORS_ALLOWED_ORIGINS`)
- [+] Добавить `.gitignore`, `requirements.txt`, начальный `README.md`
- [+] Первый push в `main`, дать ссылку преподавателю

### Фаза 2: Models — User & Property (День 2–3)
- [+] Модель **`Property`**
  ```python
  class Property(models.Model):
      owner = models.ForeignKey(User, on_delete=models.CASCADE)  # FK #1
      title = models.CharField(max_length=200)
      description = models.TextField()
      city = models.CharField(max_length=100)
      price_per_night = models.DecimalField(max_digits=8, decimal_places=2)
      max_guests = models.IntegerField()
      created_at = models.DateTimeField(auto_now_add=True)
  ```
- [+] Запустить `makemigrations` и `migrate`
- [+] Зарегистрировать модели в `admin.py`

### Фаза 3: Auth (FBV) (День 3–4)
- [+] Настроить `rest_framework.authtoken` в `INSTALLED_APPS`
- [+] `python manage.py migrate` для таблицы токенов
- [+] **`register_view`** (FBV #1) — создать пользователя, вернуть токен
  ```python
  @api_view(['POST'])
  def register_view(request): ...
  ```
- [+] **`login_view`** (FBV #2) — проверить credentials, вернуть токен
- [+] **`logout_view`** — удалить токен из БД
- [+] Добавить URL-маршруты: `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`

### Фаза 4: Property CRUD (CBV) (День 4–5)
- [+] **`PropertyListCreateView`** (CBV #1) — `ListCreateAPIView`
  - GET: список всех объектов (публично)
  - POST: создать объект (только авторизованный), автоматически `owner = request.user`
- [ ] **`PropertyDetailView`** (CBV #2) — `RetrieveUpdateDestroyAPIView`
  - GET: детали объекта
  - PUT/PATCH: только владелец
  - DELETE: только владелец
- [+] Добавить пермишены (`IsAuthenticatedOrReadOnly`, кастомный `IsOwnerOrReadOnly`)
- [+] URL-маршруты: `/api/properties/`, `/api/properties/<pk>/`

### Фаза 5: Serializers для своих моделей (День 5)
- [+] **`PropertyModelSerializer`** (ModelSerializer #1)
  - Поля: `id`, `title`, `description`, `city`, `price_per_night`, `max_guests`, `owner`, `created_at`
  - `owner` — read_only
- [+] **`RegisterSerializer`** (Serializer #1)
  - Поля: `username`, `email`, `password`, `password2`
  - Валидация: совпадение паролей
- [+] Подключить сериализаторы к вьюхам

### Фаза 6: Финальная проверка и деплой (День 6–7)
- [+] Проверить все эндпоинты Property через Postman
- [+] Проверить CORS с фронтендом
- [+] Ревью кода Дениса (сделать merge review)
- [+] Финальный `requirements.txt`: `pip freeze > requirements.txt`

---

## 🟡 Денис — Backend Dev

### Фаза 1: Подключение к проекту (День 1–2)
- [ ] Склонировать репо от Dev 1
- [ ] Создать виртуальное окружение, установить зависимости
- [ ] Убедиться что миграции применяются без ошибок
- [ ] Работать в отдельной ветке: `git checkout -b feature/booking-review`

### Фаза 2: Models — Booking & Review (День 2–3)
- [ ] Модель **`Booking`**
  ```python
  class Booking(models.Model):
      property = models.ForeignKey(Property, on_delete=models.CASCADE)  # FK #2
      guest = models.ForeignKey(User, on_delete=models.CASCADE)          # FK #3
      check_in = models.DateField()
      check_out = models.DateField()
      guests_count = models.IntegerField()
      total_price = models.DecimalField(max_digits=10, decimal_places=2)
      created_at = models.DateTimeField(auto_now_add=True)
  ```
- [ ] Модель **`Review`**
  ```python
  class Review(models.Model):
      booking = models.ForeignKey(Booking, on_delete=models.CASCADE)  # FK #4
      rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
      comment = models.TextField()
      created_at = models.DateTimeField(auto_now_add=True)
  ```
- [ ] `makemigrations` и `migrate`, зарегистрировать в `admin.py`

### Фаза 3: Serializers (День 3–4)
- [ ] **`BookingModelSerializer`** (ModelSerializer #2)
  - Поля: `id`, `property`, `guest`, `check_in`, `check_out`, `guests_count`, `total_price`
  - `guest` — read_only (берётся из `request.user`)
  - Валидация: `check_out > check_in`
- [ ] **`LoginSerializer`** (Serializer #2)
  - Поля: `username`, `password`
  - Метод `validate()` — проверка credentials через `authenticate()`
- [ ] **`ReviewSerializer`** (бонус, ModelSerializer)

### Фаза 4: Booking Views (День 4–5)
- [ ] **`BookingListCreateView`** (можно расширить CBV от Dev 1 или сделать отдельный FBV)
  - POST: создать бронирование, `guest = request.user`
  - GET: список бронирований текущего пользователя (фильтр по `request.user`)
- [ ] **`BookingDetailView`** — GET детали одного бронирования
- [ ] URL-маршруты: `/api/bookings/`, `/api/bookings/<pk>/`
- [ ] Пермишены: только авторизованный пользователь

### Фаза 5: Postman Collection (День 5–6)
- [ ] Создать Postman Collection `RentEase API`
- [ ] Добавить папки: **Auth**, **Properties**, **Bookings**
- [ ] Задокументировать все запросы с примерами тела и ответов:
  - `POST /auth/register/` — пример body + response с токеном
  - `POST /auth/login/` — пример body + token
  - `GET /properties/` — список
  - `POST /properties/` — создать (с токеном в Header)
  - `PUT /properties/<id>/` — обновить
  - `DELETE /properties/<id>/` — удалить
  - `POST /bookings/` — создать бронирование
  - `GET /bookings/` — мои бронирования
- [ ] Экспортировать как `postman_collection.json`, добавить в корень репо
- [ ] Написать секцию **API Documentation** в `README.md`

### Фаза 6: Финализация (День 6–7)
- [ ] Протестировать интеграцию с фронтендом
- [ ] Обработать edge cases: двойное бронирование на те же даты, чужое удаление
- [ ] Merge PR в `main` после ревью Саши

---

## 🔵 Камила — Frontend Dev

### Фаза 1: Инициализация Angular проекта (День 1–2) ✅
- [ ] `ng new rentease-frontend --routing --style=scss`
- [ ] Push в тот же репо в папку `frontend/`
- [ ] Установить зависимости: `@angular/forms`, `@angular/common/http`
- [ ] Настроить `proxy.conf.json` для dev (перенаправление `/api` → `localhost:8000`)
- [ ] Создать базовую структуру папок:
  ```
  src/app/
  ├── pages/
  │   ├── home/
  │   ├── properties/
  │   ├── property-detail/
  │   └── login/
  ├── services/
  ├── interfaces/
  ├── interceptors/
  └── guards/
  ```

### Фаза 2: Интерфейсы и Сервисы (День 2–3)✅
- [ ] **Интерфейсы** (`interfaces/`)
  ```typescript
  interface IProperty { id, title, description, city, price_per_night, max_guests, owner }
  interface IBooking  { id, property, guest, check_in, check_out, guests_count, total_price }
  interface IUser     { id, username, email, token }
  ```
- [ ] **`PropertyService`** (`services/property.service.ts`)
  - `getAll(): Observable<IProperty[]>` → GET `/api/properties/`
  - `getById(id): Observable<IProperty>` → GET `/api/properties/:id/`
  - `create(data): Observable<IProperty>` → POST `/api/properties/`
  - `delete(id): Observable<void>` → DELETE `/api/properties/:id/`
- [ ] **`AuthService`** (`services/auth.service.ts`)
  - `login(credentials): Observable<{token}>` → POST `/api/auth/login/`
  - `register(data): Observable<any>` → POST `/api/auth/register/`
  - `logout()` → POST `/api/auth/logout/` + очистить localStorage
  - `isLoggedIn(): boolean` → проверить токен в localStorage
- [ ] **`BookingService`** (`services/booking.service.ts`)
  - `create(data): Observable<IBooking>` → POST `/api/bookings/`
  - `getMyBookings(): Observable<IBooking[]>` → GET `/api/bookings/`

### Фаза 3: JWT Interceptor + Guard (День 3)✅
- [ ] **`AuthInterceptor`** (`interceptors/auth.interceptor.ts`)
  ```typescript
  // Добавляет к каждому запросу:
  // Authorization: Bearer <token>
  intercept(req, next) {
    const token = localStorage.getItem('token');
    if (token) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(req);
  }
  ```
- [ ] Зарегистрировать в `app.module.ts` как `HTTP_INTERCEPTORS`
- [ ] **`AuthGuard`** (`guards/auth.guard.ts`) — редирект на `/login` если нет токена
- [ ] Применить Guard на маршруты `/my-bookings`

### Фаза 4: Страницы (День 3–5)

#### 🏠 Home (`/`)✅
- [ ] Список последних 6 объектов через `PropertyService.getAll()`
- [ ] Карточка объекта: фото-placeholder, название, город, цена за ночь
- [ ] `@for` для рендера карточек
- [ ] Кнопка "Подробнее" → роутинг на `/properties/:id`
- [ ] Кнопка "Войти" / "Выйти" в шапке (через `AuthService.isLoggedIn()`)

#### 📋 Properties (`/properties`)✅
- [ ] Полный список объектов
- [ ] **Форма фильтра** (API Event #1 — запрос при изменении):
  - `[(ngModel)]="filterCity"` — поле города (Input #1)
  - `[(ngModel)]="filterMaxPrice"` — максимальная цена (Input #2)
- [ ] `@if (properties.length === 0)` → показать "Ничего не найдено"
- [ ] `@for` по отфильтрованному массиву
- [ ] Кнопка "Добавить объявление" (только авторизованным) → модальная форма:
  - Input #3: `[(ngModel)]="newProperty.title"`
  - Input #4: `[(ngModel)]="newProperty.price_per_night"`
  - Input #5: `[(ngModel)]="newProperty.city"`
  - Кнопка Submit → `PropertyService.create()` (API Event #2)

#### 🏡 Property Detail (`/properties/:id`)✅
- [ ] Загрузить объект по `:id` через `PropertyService.getById()` в `ngOnInit` (API Event #3)
- [ ] Показать все детали: название, описание, город, цена, макс. гостей
- [ ] **Форма бронирования** (только авторизованным):
  - Input #6: `[(ngModel)]="booking.check_in"` (тип date)
  - Input #7: `[(ngModel)]="booking.check_out"` (тип date)
  - Input #8: `[(ngModel)]="booking.guests_count"` (тип number)
  - Кнопка "Забронировать" → `BookingService.create()` (API Event #4)
- [ ] Обработка ошибок: `@if (errorMsg)` → показать сообщение
- [ ] Кнопка "Удалить" (только для владельца) → `PropertyService.delete()` (API Event #5)

#### 🔐 Login (`/login`)✅
- [ ] Форма входа:
  - `[(ngModel)]="credentials.username"` (Input #9)
  - `[(ngModel)]="credentials.password"` (Input #10)
- [ ] Кнопка "Войти" → `AuthService.login()`, сохранить токен в localStorage
- [ ] После успеха → роутинг на `/`
- [ ] Ссылка "Нет аккаунта?" → форма регистрации (toggle)
- [ ] `@if (loading)` → показать спиннер

### Фаза 5: Error Handling + UX (День 5–6)✅
- [ ] Глобальный error handler в каждом сервисе через `catchError`
- [ ] Показывать сообщения об ошибках пользователю (не только в консоли)
- [ ] HTTP 401 → автоматический logout через interceptor
- [ ] `@if (isLoading)` → skeleton/спиннер при загрузке данных
- [ ] Базовая SCSS стилизация: карточки, кнопки, формы, навбар

### Фаза 6: Интеграция и финализация (День 6–7) ждем бэкенд
- [ ] Протестировать все 5+ API событий с реальным бэком
- [ ] Убедиться что JWT interceptor работает (проверить в DevTools → Network)
- [ ] Проверить Guard — неавторизованный не попадает на защищённые роуты
- [ ] Финальный проход по всем требованиям чеклиста

---

## 📦 Общие задачи (все вместе)

### До предзащиты (СРОЧНО)
- [ ] **Саша**: Создать репо на GitHub
- [ ] **Саша**: Инициализировать Django проект, пушнуть
- [ ] **Камила**: Инициализировать Angular проект (`ng new`), пушнуть
- [ ] **Саша**: Обновить `README.md` — описание проекта + имена участников + ссылка на репо
- [ ] **Все**: Отправить преподавателю: состав группы, название проекта, ссылку на GitHub

### Защита (Неделя 14)
- [ ] **Денис**: Подготовить PDF-презентацию (макс. 4 слайда)
  - Слайд 1: Название, команда, тема
  - Слайд 2: Архитектура (бэк)
  - Слайд 3: Демо фронтенда (скриншоты)
  - Слайд 4: Выводы / трудности
- [ ] **Камила**: Убедиться что проект запускается на ноутбуке для демо
- [ ] **Все**: Каждый готов объяснить свою часть + знает чужую в общих чертах

---

## 📊 Сводка требований

| Требование | Кто выполняет | Статус |
|---|---|---|
| 4+ Models | Денис | ⬜ |
| 2+ ForeignKey | Денис | ⬜ |
| 2 Serializer + 2 ModelSerializer | Саша | ⬜ |
| 2 FBV + 2 CBV | Саша | ⬜ |
| Token Auth (login/logout) | Саша | ⬜ |
| Full CRUD (Property) | Саша | ⬜ |
| request.user binding | Саша ⬜ |
| CORS | Саша | ⬜ |
| Postman collection | Денис | ⬜ |
| Angular routing 3+ pages | Камила | ⬜ |
| Services + Interfaces | Камила | ⬜ |
| 4+ API events | Камила | ⬜ |
| 4+ ngModel inputs | Камила | ⬜ |
| JWT Interceptor | Камила | ⬜ |
| @for / @if | Камила | ⬜ |
| Error handling | Камила | ⬜ |
| README.md | Саша | ⬜ |
| Postman в репо | Саша | ⬜ |
| 4 слайда PDF | Денис | ⬜ |

---

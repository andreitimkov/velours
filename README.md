# 🌹 Velours — Готов к деплою

## Быстрый деплой на Render.com (бесплатно)

### Шаг 1. Создай GitHub-репозиторий

1. Зайди на [github.com](https://github.com) → **New repository**
2. Назови `velours` (приватный или публичный)
3. **Не** ставь галочки (README, .gitignore, license)
4. Нажми **Create repository**

### Шаг 2. Залей этот проект в репозиторий

```bash
cd velours-deploy
git init
git add .
git commit -m "Velours — ready to deploy"
git branch -M main
git remote add origin https://github.com/ТВОЙ_USERNAME/velours.git
git push -u origin main
```

### Шаг 3. Деплой на Render.com

1. Зайди на [render.com](https://render.com) → Sign up (через GitHub)
2. Нажми **New** → **Web Service**
3. Выбери репозиторий `velours`
4. Настройки (большинство заполнятся автоматически):
   - **Name**: `velours`
   - **Region**: Frankfurt (EU Central) — ближайший к тебе
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
5. Добавь **Environment Variables**:
   - `JWT_SECRET` → любая длинная случайная строка (например: `kF9x2mQpLz7Wv4nRtY8s`)
   - `ALLOWED_ORIGINS` → `*`
   - `NODE_ENV` → `production`
6. Нажми **Deploy Web Service**

### Шаг 4. Готово!

Через 1–2 минуты сайт будет доступен по адресу:
```
https://velours.onrender.com
```

Админка:
```
https://velours.onrender.com/admin/
Логин: admin@velours.ru
Пароль: admin
```

---

## Альтернативные бесплатные хостинги

| Хостинг | Плюсы | Минусы |
|---------|-------|--------|
| **Render.com** ✅ | Прост, Node + SQLite, авто-деплой из Git | Засыпает через 15 мин бездействия, просыпается ~30 сек |
| **Railway.app** | 500 часов бесплатно, быстрый | Лимит часов, нужна карта |
| **Fly.io** | Быстрый, Docker-based | Сложнее настройка |
| **Glitch.com** | Мгновенный, можно редактировать в браузере | Засыпает, медленный |

**Render.com — лучший выбор** для проверки работоспособности.

---

## Структура проекта

```
velours-deploy/
├── server.js          ← Express API сервер
├── database.js        ← SQLite база + seed данных
├── package.json       ← Зависимости Node.js
├── render.yaml        ← Авто-конфиг для Render
├── .env.example       ← Шаблон переменных окружения
├── .gitignore
├── README.md          ← Эта инструкция
└── public/            ← Фронтенд (отдаётся Express'ом)
    ├── index.html
    ├── css/
    │   ├── style.css
    │   └── pages.css
    ├── js/
    │   ├── api.js     ← API-клиент (вместо db.js)
    │   ├── cart.js
    │   ├── db.js      ← Старый localStorage-клиент (не используется)
    │   └── main.js
    ├── pages/
    │   ├── auth.html
    │   ├── cabinet.html
    │   └── checkout.html
    └── admin/
        └── index.html
```

## Важно

- БД SQLite хранится в файле `velours.db` — на Render Free диск **не персистентный**, при рестарте данные сбросятся до seed. Для постоянного хранения используй платный тариф или замени на PostgreSQL.
- Загруженные фото (`/uploads/`) также не сохранятся при рестарте на Free. Для продакшена подключи облачное хранилище (S3, Cloudinary).
- Бесплатный Render засыпает через ~15 мин. Первый запрос после сна занимает ~30 сек.

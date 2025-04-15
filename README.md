## Запуск приложения

### 1. Запуск бэкенда

```bash
cd backend
npm install
npm start
```

Сервер запустится на порту 3000: http://localhost:3000

### 2. Запуск фронтенда

```bash
cd frontend
npx serve -p 5500
```

Затем откройте в браузере: http://localhost:5500

## API Endpoints

- `POST /register` - регистрация нового пользователя
- `POST /login` - авторизация пользователя
- `GET /profile` - получение данных профиля (для авторизованных)
- `POST /logout` - выход из системы
- `GET /data` - получение данных с кэшированием
- `POST /theme` - обновление темы интерфейса 
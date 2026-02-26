# 🛍️ AdsPortal V2 - Frontend

Современное веб-приложение для размещения объявлений, написанное на **Vue 3** + **TypeScript** + **Vite**.

## ✨ Особенности

- **TypeScript** - Полная типизация для безопасности типов
- **Vue 3** - Latest версия Vue с Composition API
- **Pinia** - State management
- **Vue Router 4** - Маршрутизация с защитой авторизации
- **Axios** - HTTP client с глобальной обработкой ошибок
- **Bootstrap 5** - UI компоненты
- **Vite** - Быстрый build tool
- **Vitest** - Unit тестирование
- **ESLint + Prettier** - Code quality

## 📋 Основной функционал

- ✅ Регистрация и вход (с реал-тайм валидацией)
- ✅ Управление профилем пользователя
- ✅ Создание и редактирование объявлений (с поддержкой загрузки/удаления изображений)
- ✅ JWT аутентификация
- ✅ Защита маршрутов на основе авторизации
- ✅ Обработка ошибок API
- ✅ Абортирование запросов при unmount

## 🚀 Быстрый старт

### Требования
- Node.js >= 18.0.0
- npm >= 8.0.0

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/666Master999/AdsPortal_V2-Frontend.git
cd AdsPortal_V2-Frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Build для production

```bash
npm run build    # Создать production build
npm run preview  # Просмотреть production build локально
```

## 📚 Основные команды

```bash
npm run dev          # Запуск dev сервера
npm run build        # Production build
npm run preview      # Просмотр production build
npm run type-check   # Проверка типов TypeScript
npm run lint         # ESLint проверка и фикс
npm run format       # Форматирование кода (Prettier)
npm run test         # Запуск unit тестов
npm run test:ui      # Vitest UI
npm run coverage     # Тестовое покрытие
```

## 📁 Структура проекта

```
src/
├── api/                   # API сервисы
│   ├── apiClient.ts       # Axios instance
│   ├── apiConfig.ts       # Конфигурация
│   ├── authService.ts     # Auth endpoints
│   ├── adsService.js      # Ads endpoints
│   ├── userService.js     # User endpoints
│   └── profileService.js  # Profile endpoints
│
├── stores/                # Pinia stores
│   └── authStore.ts       # Auth state management
│
├── router/                # Vue Router
│   └── index.ts           # Маршруты и guards
│
├── components/            # Vue компоненты
│   ├── AuthForm.vue       # Форма входа/регистрации
│   ├── Header.vue         # Шапка приложения
│   └── ...
│
├── pages/                 # Page компоненты
│   ├── Login.vue
│   ├── Register.vue
│   ├── Profile.vue
│   ├── CreateAd.vue
│   └── UserProfile.vue
│
├── views/                 # View компоненты
│   └── HomeView.vue
│
├── utils/                 # Утилиты
│   ├── authUtils.ts       # Auth helpers
│   ├── validators.ts      # Валидация
│   └── format.js          # Форматирование
│
├── composables/           # Vue composables
│   └── useAbortable.ts    # Для асинхронных операций
│
├── config/                # Конфигурация
│   └── apiConfig.ts       # API endpoints
│
├── types/                 # TypeScript типы
│   └── index.ts           # Глобальные типы
│
├── main.ts                # Entry point
├── App.vue                # Root компонент
└── style.css              # Глобальные стили
```

## 🔐 Аутентификация

### Login

```typescript
import * as authApi from '@/api/authService';

const response = await authApi.loginUser({
  login: 'user123',
  password: 'password'
});

const token = response.data.token;
auth.setToken(token);  // Сохраняет в localStorage
```

### Register

```typescript
const response = await authApi.registerUser({
  login: 'newuser',
  password: 'SecurePass123'
});
```

### Auto-refresh

Токен автоматически обновляется при нужде:

```typescript
if (auth.isTokenExpired) {
  await auth.refreshToken();
}
```

## ✅ Валидация

### Frontend валидация (validators.ts)

```typescript
import { 
  validateLogin, 
  validatePassword,
  validateEmail,
  validateCreateAd 
} from '@/utils/validators';

// Показ ошибок
const result = validateLogin('user');
if (!result.isValid) {
  console.error(result.error);  // "Логин должен содержать минимум 3 символа"
}
```

### Требования к паролю

- Минимум 3 символа
- Максимум 50 символов
- Хотя бы одна заглавная буква
- Хотя бы одна цифра
- Опционально специальные символы

## 📋 API Endpoints

Все endpoints определены в `src/config/apiConfig.ts`:

```typescript
API_ENDPOINTS.AUTH_LOGIN       // POST /api/auth/login
API_ENDPOINTS.AUTH_REGISTER    // POST /api/auth/register
API_ENDPOINTS.AUTH_REFRESH     // POST /api/auth/refresh
API_ENDPOINTS.USERS_PROFILE    // GET /api/users/profile
API_ENDPOINTS.ADS_LIST         // GET /api/ads
API_ENDPOINTS.ADS_CREATE       // POST /api/ads
```

## 🛡️ Защита маршрутов

Маршруты защищены на основе аутентификации:

```typescript
// Требует авторизации
{ path: '/profile/edit', component: Profile, meta: { requiresAuth: true } }

// Только для неавторизованных (гостей)
{ path: '/login', component: Login, meta: { guestOnly: true } }
```

## 🧪 Тестирование

### Запуск тестов

```bash
npm run test       # Запуск тестов
npm run test:ui    # Vitest UI интерфейс
npm run coverage   # Тестовое покрытие
```

### Написание тестов

Тесты должны находиться рядом с компонентом:

```
src/
├── stores/
│   ├── authStore.ts
│   └── authStore.spec.ts      # Тест для authStore
```

## 📦 Зависимости

### Main Dependencies
- **vue** - UI framework
- **vue-router** - Маршрутизация
- **pinia** - State management
- **axios** - HTTP client
- **bootstrap** - UI components

### Dev Dependencies
- **typescript** - Типизация
- **vite** - Build tool
- **vitest** - Testing framework
- **eslint** - Linting
- **prettier** - Code formatting
- **vue-tsc** - TypeScript для Vue

## 🔄 Миграция на TypeScript

Проект полностью мигрирован на TypeScript! 

Подробподробно информация: [TYPESCRIPT_MIGRATION.md](./TYPESCRIPT_MIGRATION.md)

### Что было обновлено:
- ✅ TypeScript конфигурация
- ✅ Глобальные типы
- ✅ API слой с типизацией
- ✅ Store с типизацией
- ✅ Router с типизацией
- ✅ Composables с типизацией
- ✅ Валидация с TypeScript
- ✅ Полная документация

## 📖 Гайды

- [Быстрый старт](./SETUP_GUIDE.md)
- [TypeScript миграция](./TYPESCRIPT_MIGRATION.md)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Guide](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)

## 🐛 Отладка

### Dev Tools

```bash
# Запустить с source maps
npm run dev

# Проверить типы перед build
npm run type-check

# Проверить ESLint ошибки
npm run lint
```

### Network

Proxy для API в dev режиме настроен в `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: process.env.VITE_API_BASE || 'https://localhost:7145',
    secure: false,
    changeOrigin: true
  }
}
```

## 🚢 Deployment

### Netlify

```toml
# netlify.toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### Build output

```
dist/
├── index.html
├── assets/
│   ├── main-*.js
│   └── main-*.css
└── _redirects
```

## 📝 Environment Variables

Создайте `.env.local` для локального development:

```env
VITE_API_BASE=https://localhost:7145
```

Для production используйте `.env.production`:

```env
VITE_API_BASE=https://adportal.runasp.net
```

## 🤝 Contributing

1. Fork репозиторий
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - смотри [LICENSE](./LICENSE)

## 👨‍💻 Author

**666Master999** - GitHub: [@666Master999](https://github.com/666Master999)

## 🎓 Статус

Проект разработан как дипломная работа. Текущий статус: **Production Ready**

- ✅ TypeScript
- ✅ Валидация
- ✅ Документация
- ✅ Git Repository
- 🔄 Тесты (в процессе)
- 🔄 Дополнительные компоненты (в процессе)

---

**Созданы:**
- Repository: https://github.com/666Master999/AdsPortal_V2-Frontend.git
- Deployment: TBD


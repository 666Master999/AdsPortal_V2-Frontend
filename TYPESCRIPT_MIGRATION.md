# TypeScript Migration & Improvements

## 📋 Overview

Этот документ описывает миграцию AdsPortal V2 Frontend на TypeScript, улучшение валидации и добавление полной документации.

## 🎯 Что было сделано

### 1. **TypeScript Configuration** ✅

Добавлены файлы конфигурации:

- **`tsconfig.json`** - Базовая конфигурация TypeScript
- **`tsconfig.app.json`** - Конфигурация для приложения
- **`tsconfig.node.json`** - Конфигурация для инструментов (Vite, Vitest)
- **`src/env.d.ts`** - Типы для import.meta.env переменных Vite

#### Key Compiler Options:
```json
{
  "strict": true,          // Полная проверка типов
  "noUnusedLocals": true,  // Ошибка на неиспользованные переменные
  "noUnusedParameters": true,
  "resolveJsonModule": true,
  "paths": { "@/*": ["./src/*"] }
}
```

### 2. **Type Definitions** ✅

Создан файл `src/types/index.ts` с глобальными типами:

```typescript
// Основные интерфейсы для аутентификации, профилей, объявлений
- AuthPayload
- AuthState
- AuthResponse
- UserProfile
- Advertisement
- ApiError
- ValidationError
```

### 3. **Validation Utilities** ✅

Новый файл `src/utils/validators.ts` с улучшенной валидацией:

#### Функции валидации:
- `validateLogin(login)` - Проверка логина (3-50 символов, букв/цифр/точек)
- `validatePassword(password, requirements)` - Проверка пароля с requirements
  - Минимум 3 символа
  - Максимум 50 символов
  - Заглавная буква и цифра обязательны
- `validateEmail(email)` - Проверка email формата
- `validatePrice(price)` - Проверка цены объявления
- `validateAdTitle(title)` - Проверка заголовка (5-100 символов)
- `validateDescription(description)` - Проверка описания (10-3000 символов)
- `validateRegistration(login, password, confirm)` - Полная валидация регистрации
- `validateCreateAd(title, description, price)` - Валидация создания объявления

#### Формат результата:
```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

### 4. **Auth Utilities Upgrade** ✅

Обновлен `src/utils/authUtils.ts` с новыми функциями:

```typescript
// Существующие функции (с типизацией)
- extractToken(response)
- extractPublicId(response)
- getErrorMessage(error, defaultMsg)
- logError(error, prefix)

// Новые функции
- isTokenExpired(token)         // Проверка истечения JWT
- checkOwnership(userId, resourceOwnerId) // Проверка владения ресурсом
- formatValidationErrors(errors) // Форматирование ошибок валидации
```

### 5. **Auth Store (Pinia)** ✅

Полная миграция `src/stores/authStore.ts`:

```typescript
// State
- token: JWT токен
- login: Логин пользователя
- publicId: ID пользователя
- initialized: Флаг инициализации

// Getters
- userLogin                    // Нормализованный логин
- userId                       // Нормализованный ID
- isAuthenticated              // Проверка авторизации
- isTokenExpired               // Проверка истечения токена (NEW)
- isOwn(id)                    // Проверка владельца ресурса

// Actions
- decodeJwtPayload(token)      // Декодирование JWT
- setAuthToken(token)          // Установка Authorization header
- setPublicId(id)              // Установка ID с валидацией
- applyPayload(payload)        // Применение JWT payload
- init()                       // Инициализация при загрузке
- setToken(token)              // Установка нового токена
- logout()                     // Логаут пользователя
- fetchUserId()                // Получение ID от сервера
- refreshToken() (NEW)         // Обновление JWT токена
```

### 6. **API Layer** ✅

#### `src/config/apiConfig.ts` (NEW)
```typescript
- TOKEN_KEY          // Ключ для localStorage
- API_BASE_URL       // Базовый URL API
- API_TIMEOUT        // Таймаут для запросов
- API_ENDPOINTS      // Константы для endpoints
```

#### `src/api/apiClient.ts` (TypeScript)
```typescript
- apiClient          // Axios instance с interceptors
- apiService         // Типизированные методы (get, post, put, delete)
```

Добавлены глобальные interceptors:
- Обработка 401 ошибок (автоматический логаут)
- Автоматическое добавление Authorization header

#### `src/api/authService.ts` (TypeScript)
```typescript
// Интерфейсы
- RegisterPayload
- LoginPayload

// Функции
- registerUser(payload)
- loginUser(payload)
- refreshToken()     // (NEW)
- logoutUser()       // (NEW)
```

Все функции имеют полную документацию с примерами использования.

### 7. **Composables** ✅

Обновлен `src/composables/useAbortable.ts`:

```typescript
// Типизированный composable для асинхронных операций
- Управление loading состоянием
- Обработка ошибок
- Отмена запроса при unmount (AbortController)
- Предотвращение memory leaks

// Интерфейсы
- AsyncAction<T>       // Тип для асинхронной функции
- UseAbortableReturn<T> // Возвращаемый тип

// Методы
- run(action)          // Выполнить асинхронную операцию
```

### 8. **Router Configuration** ✅

Обновлен `src/router/index.ts`:

```typescript
// Типизированные маршруты
// Расширенные meta для маршрутов:
- requiresAuth       // Требует авторизации
- guestOnly          // Только для гостей
- title              // Название страницы

// Guards
- beforeEach()       // Проверка прав доступа
- afterEach()        // Обновление title (NEW)
```

### 9. **Components** ✅

#### `src/components/AuthForm.vue` (Улучшен)

```vue
// Новые фичи:
- Реал-тайм валидация на blur
- Показ ошибок валидации для каждого поля
- TypeScript с полной типизацией
- Подтверждение пароля для регистрации (NEW)
- Визуальные индикаторы невалидных полей (NEW)

// Props
- mode: 'login' | 'register'

// Events
- Редирект на профиль или главную после успеха
```

### 10. **Entry Point** ✅

Обновлен `src/main.ts`:

```typescript
// Инициализация Vue приложения
// Инициализация Pinia store
// Инициализация Router
// Инициализация auth состояния перед монтированием
```

### 11. **Build Configuration** ✅

#### `vite.config.ts`
```typescript
- @ alias для импортов
- Development server proxy для /api
- DEV сервер на порту 5173
- Production build конфигурация
```

#### `vitest.config.ts`
```typescript
- jsdom окружение для unit тестов
- Глобальные тесты переменные (describe, it, expect)
- Coverage конфигурация
```

#### `package.json`
```json
// Добавлены scripts:
- "type-check"  // Проверка типов: npm run type-check

// Добавлены devDependencies:
- typescript
- vue-tsc
- @vue/tsconfig
```

### 12. **Documentation** ✅

Каждый файл содержит:
- **JSDoc/TSDoc комментарии** для всех функций и методов
- **Типизированные параметры и возвращаемые значения**
- **Примеры использования** в комментариях
- **Подробное описание logic**

## 📁 Файловая структура (новые файлы)

```
src/
├── types/
│   └── index.ts                    # Глобальные типы
├── utils/
│   ├── validators.ts               # Утилиты валидации (NEW)
│   └── authUtils.ts                # Обновлены с типами
├── api/
│   ├── apiConfig.ts                # Конфигурация API (NEW)
│   ├── apiClient.ts                # Обновлены с типами
│   └── authService.ts              # Обновлены с типами
├── stores/
│   └── authStore.ts                # Обновлены с типами
├── composables/
│   └── useAbortable.ts             # Обновлены с типами
├── router/
│   └── index.ts                    # Обновлены с типами
├── components/
│   └── AuthForm.vue                # Улучшены с валидацией
├── main.ts                         # Обновлены на TypeScript
├── env.d.ts                        # Типы для Vite (NEW)
└── ...

vite.config.ts                      # Обновлены на TypeScript
vitest.config.ts                    # Обновлены на TypeScript
tsconfig.json                       # Новый файл (NEW)
tsconfig.app.json                   # Новый файл (NEW)
tsconfig.node.json                  # Новый файл (NEW)
```

## 🔄 Миграция старых файлов

### JavaScript → TypeScript

Следующие файлы можно переименовать и обновить:

Old → New:
```
src/main.js              → src/main.ts          ✅ (done)
src/router/index.js      → src/router/index.ts  ✅ (done)
src/stores/authStore.js  → src/stores/authStore.ts ✅ (done)
src/api/apiClient.js     → src/api/apiClient.ts ✅ (done)
src/api/authService.js   → src/api/authService.ts ✅ (done)
src/config/apiConfig.js  → src/config/apiConfig.ts ✅ (done)
src/composables/useAbortable.js → src/composables/useAbortable.ts ✅ (done)
src/utils/authUtils.js   → src/utils/authUtils.ts ✅ (done)
vite.config.js           → vite.config.ts ✅ (done)
vitest.config.js         → vitest.config.ts ✅ (done)
```

## 🚀 Как использовать

### Проверка типов:
```bash
npm run type-check
```

### Запуск development сервера:
```bash
npm run dev
```

### Build для production:
```bash
npm run build
```

### Запуск тестов:
```bash
npm run test
npm run coverage
```

## 📚 Примеры использования

### Валидация формы
```typescript
import { validateLogin, validatePassword } from '@/utils/validators';

const loginResult = validateLogin('user123');
if (!loginResult.isValid) {
  console.error(loginResult.error);
}

const passwordResult = validatePassword('MyP@ssw0rd', {
  minLength: 10,
  requireSpecialChars: true
});
```

### Работа с Auth Store
```typescript
import { useAuthStore } from '@/stores/authStore';

const auth = useAuthStore();

// Проверка авторизации
if (auth.isAuthenticated) {
  console.log('Пользователь:', auth.userLogin);
}

// Проверка владения ресурсом
if (auth.isOwn(profileId)) {
  // Это профиль текущего пользователя
}

// Проверка истечения токена
if (auth.isTokenExpired) {
  await auth.refreshToken();
}
```

### Использование useAbortable
```typescript
import { useAbortable } from '@/composables/useAbortable';

const { loading, error, run } = useAbortable('Ошибка загрузки');

const fetchData = async () => {
  const data = await run(async (signal) => {
    const res = await api.get('/api/data', { signal });
    return res.data;
  });
};
```

### API запросы
```typescript
import * as authApi from '@/api/authService';

try {
  const response = await authApi.loginUser({
    login: 'user',
    password: 'password'
  });
  
  const token = response.data.token;
} catch (error) {
  console.error('Ошибка входа:', error);
}
```

## ✅ Чек-лист для завершения миграции

- [x] Настроить TypeScript конфигурацию
- [x] Создать глобальные типы
- [x] Создать утилиты валидации
- [x] Миграция API слоя на TypeScript
- [x] Миграция Store на TypeScript
- [x] Миграция Router на TypeScript
- [x] Миграция Composables на TypeScript
- [x] Обновить компоненты (AuthForm)
- [x] Добавить документацию
- [x] Обновить package.json с TS зависимостями
- [ ] Миграция остальных компонентов (Profile, CreateAd и т.д.) - **TODO**
- [ ] Добавить unit тесты (authStore, validators, etc.) - **TODO**
- [ ] Добавить E2E тесты (auth flows) - **TODO**
- [ ] Удалить старые .js файлы после полной миграции - **TODO**

## 🎓 Рекомендации

1. **Postman/API Testing** - Тестируйте API endpoints перед использованием в компонентах
2. **Error Boundaries** - Добавьте error boundaries для обработки ошибок в компонентах
3. **Logging** - Рассмотрите использование логирования библиотеки для production
4. **Environment Variables** - Используйте `.env.local` для локального development
5. **Code Review** - Проверьте типизацию перед merge в main ветку

## 🔗 Полезные ссылки

- [TypeScript Vue 3](https://vuejs.org/guide/typescript/overview.html)
- [Pinia TypeScript](https://pinia.vuejs.org/cookbook/composables.html)
- [Vue Router 4](https://router.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [Axios](https://axios-http.com/)

/**
 * @file Pinia store для управления состоянием аутентификации
 * 
 * Управляет:
 * - JWT токеном и его хранением в localStorage
 * - Данными текущего пользователя (login, publicId)
 * - Инициализацией состояния при загрузке приложения
 * - Логаутом и очисткой токена
 */

import { defineStore } from 'pinia';
import { apiClient } from '@/api/apiClient';
import { TOKEN_KEY } from '@/config/apiConfig';
import { isTokenExpired } from '@/utils/authUtils';
import type { AuthPayload, AuthState } from '@/types';

const STORAGE_KEY = TOKEN_KEY || 'auth_token';

/**
 * Pinia store для аутентификации
 * 
 * @example
 * ```ts
 * const auth = useAuthStore();
 * 
 * // Проверка аутентификации
 * if (auth.isAuthenticated) {
 *   console.log('Пользователь:', auth.userLogin);
 * }
 * 
 * // Вход/регистрация
 * await auth.setToken(token);
 * 
 * // Выход
 * auth.logout();
 * ```
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState & { client: typeof apiClient } => ({
    /** JWT токен доступа */
    token: null,
    /** Логин пользователя */
    login: null,
    /** Публичный ID пользователя (хранится как число) */
    publicId: null,
    /** Флаг инициализации состояния */
    initialized: false,
    /** Axios client для API запросов */
    client: apiClient
  }),

  getters: {
    /**
     * Нормализованный логин пользователя (пустая строка если не авторизован)
     */
    userLogin: (state) => state.login || '',

    /**
     * Нормализованный публичный ID пользователя или null
     */
    userId: (state) => (state.publicId != null ? String(state.publicId) : null),

    /**
     * Проверка если пользователь авторизован
     */
    isAuthenticated: (state) => !!(state.login || state.publicId),

    /**
     * Проверка истечения срока действия токена
     */
    isTokenExpired: (state) => state.token ? isTokenExpired(state.token) : true,

    /**
     * Вспомогательный метод для проверки владельца профиля/ресурса
     * @param state - Состояние store
     * @returns Функция для проверки владельца
     * 
     * @example
     * ```ts
     * if (auth.isOwn(profileId)) {
     *   // Это профиль текущего пользователя
     * }
     * ```
     */
    isOwn: (state) => (id: string | number | null | undefined) => {
      if (!id) return false;
      const sid = state.publicId != null ? String(state.publicId) : null;
      return sid === String(id) || state.login === String(id);
    }
  },

  actions: {
    /**
     * Декодирует JWT payload из токена
     * Поддерживает URL-safe base64 декодирование
     * 
     * @param token - JWT токен
     * @returns Распарсенный payload или null
     * 
     * @internal
     */
    decodeJwtPayload(token: string | null | undefined): AuthPayload | null {
      try {
        if (!token || typeof token !== 'string') return null;

        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // URL-safe base64 декодирование
        const payload = parts[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        const decoded = atob(payload);

        // Декодируем UTF-8
        const json = decodeURIComponent(
          decoded
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        return JSON.parse(json) as AuthPayload;
      } catch {
        return null;
      }
    },

    /**
     * Устанавливает Authorization header для apiClient
     * 
     * @param token - JWT токен (или null для удаления)
     * 
     * @internal
     */
    setAuthToken(token: string | null): void {
      if (token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete this.client.defaults.headers.common['Authorization'];
      }
    },

    /**
     * Устанавливает публичный ID пользователя с валидацией
     * 
     * @param id - ID для установки (может быть число, строка или null)
     * 
     * @internal
     */
    setPublicId(id: number | string | null | undefined): void {
      if (id == null || id === '') {
        this.publicId = null;
        return;
      }

      const n = Number(id);
      this.publicId = Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
    },

    /**
     * Применяет payload из JWT к состоянию store
     * Извлекает login и publicId из различных возможных полей
     * 
     * @param payload - Распарсенный JWT payload
     * 
     * @internal
     */
    applyPayload(payload: AuthPayload | null | undefined): void {
      if (!payload) return;

      this.login = payload.login ?? payload.username ?? null;

      const pid =
        payload.public_id ?? payload.publicId ?? payload.id ?? null;

      if (pid) {
        this.setPublicId(pid);
      } else {
        const sub = payload.sub ?? payload.userId ?? null;
        this.setPublicId(sub);
      }
    },

    /**
     * Инициализирует состояние аутентификации при загрузке приложения
     * Восстанавливает токен из localStorage и валидирует его
     * 
     * @example
     * ```ts
     * // Обычно вызывается в router guard
     * await auth.init();
     * ```
     */
    async init(): Promise<void> {
      if (this.initialized) return;

      const token = localStorage.getItem(STORAGE_KEY);

      if (token) {
        this.token = token;
        this.setAuthToken(token);

        const payload = this.decodeJwtPayload(token);
        this.applyPayload(payload);

        // Если данные не получены из токена — запросим профиль
        if (!this.publicId && !this.login) {
          try {
            const res = await this.client.get('/api/users/profile');
            const data = res?.data || {};
            this.login = this.login ?? data.login ?? data.username ?? null;
            this.setPublicId(data.publicId ?? data.id ?? data.userId ?? null);
          } catch {
            // Токен невалиден — логируем пользователя
            this.logout();
          }
        }
      }

      this.initialized = true;
    },

    /**
     * Устанавливает новый токен и обновляет состояние
     * Сохраняет токен в localStorage и применяет payload
     * 
     * @param token - JWT токен от сервера
     * @throws Не выбрасывает исключения, но логирует в консоль если что-то не так
     * 
     * @example
     * ```ts
     * const response = await api.post('/auth/login', credentials);
     * const token = response.data.token;
     * auth.setToken(token);
     * ```
     */
    setToken(token: string | null): void {
      if (!token) {
        this.logout();
        return;
      }

      this.token = token;
      localStorage.setItem(STORAGE_KEY, token);
      this.setAuthToken(token);

      const payload = this.decodeJwtPayload(token);
      this.applyPayload(payload);
    },

    /**
     * Логирует пользователя и очищает состояние
     * Удаляет токен из localStorage и очищает все данные пользователя
     * 
     * @example
     * ```ts
     * auth.logout();
     * router.push({ name: 'login' });
     * ```
     */
    logout(): void {
      this.token = null;
      this.login = null;
      this.publicId = null;
      localStorage.removeItem(STORAGE_KEY);
      this.setAuthToken(null);
    },

    /**
     * Получает ID пользователя тек/api/users/profile endpoint
     * Используется если ID не был получен из токена
     * 
     * @returns Публичный ID пользователя или null
     * 
     * @example
     * ```ts
     * const userId = await auth.fetchUserId();
     * if (userId) {
     *   console.log('ID пользователя:', userId);
     * }
     * ```
     */
    async fetchUserId(): Promise<number | null> {
      if (this.publicId) return this.publicId;

      try {
        const res = await this.client.get('/api/users/profile');
        const data = res?.data || {};

        this.login = this.login ?? data.login ?? data.username ?? null;

        const id = data.publicId ?? data.public_id ?? data.id ?? data.userId ?? null;
        this.setPublicId(id);

        return this.publicId;
      } catch {
        return null;
      }
    },

    /**
     * Обновляет токен если он вот-вот истечёт
     * Полезно для длительных сессий
     * 
     * @returns true если токен был успешно обновлён
     */
    async refreshToken(): Promise<boolean> {
      try {
        const res = await this.client.post('/api/auth/refresh');
        const newToken = res?.data?.token || res?.data?.accessToken;

        if (newToken) {
          this.setToken(newToken);
          return true;
        }

        return false;
      } catch {
        // Обновить не удалось — логируем пользователя
        this.logout();
        return false;
      }
    }
  }
});

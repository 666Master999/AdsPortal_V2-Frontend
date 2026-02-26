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
import { TOKEN_KEY, API_ENDPOINTS } from '@/config/apiConfig';
import { isTokenExpired, decodeJwtPayload } from '@/utils/authUtils';
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
  state: (): AuthState => ({
    /** JWT токен доступа */
    token: null,
    /** Логин пользователя */
    login: null,
    /** Публичный ID пользователя (хранится как число) */
    publicId: null,
    /** Список ролей (['Admin'] и т.п.) */
    roles: [],
    /** Флаг блокировки текущего юзера */
    isBlocked: false,
    /** Флаг инициализации состояния */
    initialized: false,
  }),

  getters: {
    /** Логин текущего пользователя */
    userLogin: (state) => state.login || '',
    /** Есть ли у пользователя административная роль */
    isAdmin: (state) => (state.roles ?? []).some(r => String(r).toLowerCase() === 'admin'),
    /** Заблокирован ли текущий пользователь */
    userIsBlocked: (state) => !!state.isBlocked,
    /** Нормализованный публичный ID пользователя или null */
    userId: (state): string | null => (state.publicId != null ? String(state.publicId) : null),
    /** Проверка если пользователь авторизован и токен не протух */
    isAuthenticated: (state) => Boolean(state.token && !isTokenExpired(state.token)),
    /** Проверка истечения срока действия токена */
    isTokenExpired: (state) => state.token ? isTokenExpired(state.token) : true,
    /**
     * Вспомогательный метод для проверки владельца профиля/ресурса
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
    },
  },

  actions: {

    /** Устанавливает Authorization header для apiClient */
    setAuthToken(token: string | null) {
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    },

    /** Устанавливает публичный ID пользователя с проверкой */
    setPublicId(id: number | string | null | undefined) {
      if (id == null || id === '') {
        this.publicId = null;
        return;
      }

      const n = Number(id);
      this.publicId = Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
    },

    /** Применяет payload JWT к состоянию, включая login/ID/роли */
    applyPayload(payload: AuthPayload | null | undefined) {
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

      // роли и блокировка из payload (если сервер их поместил в JWT)
      if (Array.isArray(payload.roles)) {
        this.roles = payload.roles.map((r: string) => String(r));
      }
      if (typeof payload.isBlocked === 'boolean') {
        this.isBlocked = payload.isBlocked;
      }
    },

    /**
     * Инициализирует состояние аутентификации при загрузке приложения
     * Восстанавливает токен из localStorage и валидирует его
     *
     * Обычно используется в guard `router.beforeEach`.
     */
    async init() {
      if (this.initialized) return;

      const token = localStorage.getItem(STORAGE_KEY);

      if (token) {
        // Если токен уже истёк — сразу очищаем и не пускаем пользователя как авторизованного
        if (isTokenExpired(token)) {
          this.logout();
        } else {
          this.token = token;
          this.setAuthToken(token);

          const payload = decodeJwtPayload(token);
          this.applyPayload(payload);

          // Попробуем получить профиль сервера, чтобы подтянуть роли / флаг блокировки
          try {
            const res = await apiClient.get(API_ENDPOINTS.USERS_PROFILE);
            const data = res?.data || {};
            this.login = this.login ?? data.login ?? data.username ?? null;
            this.setPublicId(data.publicId ?? data.id ?? data.userId ?? null);
            if (Array.isArray(data.roles)) {
              this.roles = data.roles.map((r: any) => String(r));
            }
            if (typeof data.isBlocked === 'boolean') {
              this.isBlocked = data.isBlocked;
            }
          } catch (err) {
            // игнорируем ошибку запроса профиля, 401 обработан снизу
          }
        }
      }

      this.initialized = true;
    },

    /**
     * Устанавливает новый JWT- токен, сохраняет в localStorage и обновляет заголовок
     * После установки автоматически применяет данные из payload.
     *
     * @param token JWT токен или `null` для очистки.
     */
    setToken(token: string | null) {
      if (!token) {
        this.logout();
        return;
      }

      this.token = token;
      localStorage.setItem(STORAGE_KEY, token);
      this.setAuthToken(token);

      const payload = decodeJwtPayload(token);
      this.applyPayload(payload);
    },

    /**
     * Логирует пользователя и очищает состояние
     * Удаляет токен из localStorage и обнуляет все поля.
     */
    logout() {
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
    /**
     * @returns {Promise<number|null>}
     */
    async fetchUserId() {
      if (this.publicId) return this.publicId;

      try {
        const res = await apiClient.get(API_ENDPOINTS.USERS_PROFILE);
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
        const res = await apiClient.post(API_ENDPOINTS.AUTH_REFRESH);
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

// заглушка: отдельный тип, чтобы store можно было именованно импортировать
export type AuthStore = ReturnType<typeof useAuthStore>;


// src/stores/authStore.js
// Pinia store for authentication (token, login, publicId)

import { defineStore } from 'pinia';
import { apiClient } from '@/api/apiClient';
import { TOKEN_KEY as CONFIG_TOKEN_KEY } from '@/config/apiConfig';

const TOKEN_KEY = CONFIG_TOKEN_KEY || 'auth_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    login: null,
    publicId: null,           // public numeric id from backend (stored as number)
    initialized: false,
    client: apiClient
  }),
  getters: {
    /** normalized login string (empty when no user) */
    userLogin: (state) => state.login || '',
    /** normalized public id string or null */
    userId: (state) => (state.publicId != null ? String(state.publicId) : null),
    /** derived boolean showing auth status */
    isAuthenticated: (state) => !!(state.login || state.publicId),
    /** simple helper for checking ownership of a profile */
    isOwn: (state) => (id) => {
      const sid = state.publicId != null ? String(state.publicId) : null;
      return sid === String(id) || state.login === id;
    }
  },
  actions: {
    decodeJwtPayload(token) {
      try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(payload);
        const json = decodeURIComponent(decoded.split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(json);
      } catch {
        return null;
      }
    },

    setAuthToken(token) {
      if (token) this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      else delete this.client.defaults.headers.common['Authorization'];
    },

    // Вспомогательный сеттер для publicId
    setPublicId(id) {
      if (id == null || id === '') {
        this.publicId = null;
        return;
      }
      const n = Number(id);
      this.publicId = Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
    },

    // apply JWT payload object to store (login + publicId)
    applyPayload(payload) {
      this.login = payload?.login ?? payload?.username ?? null;
      const pid =
        payload?.public_id ?? payload?.publicId ?? payload?.publicId ?? null;
      if (pid) {
        this.setPublicId(pid);
      } else {
        const sub = payload?.sub ?? payload?.id ?? payload?.userId ?? null;
        this.setPublicId(sub);
      }
    },

    async init() {
      if (this.initialized) return;
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        this.token = token;
        this.setAuthToken(token);

        const payload = this.decodeJwtPayload(token);
        this.applyPayload(payload);

        // computed by getter

        // если publicId/login не извлеклись из токена — можно опционально запросить /api/users/me
        // но лучше избегать лишних запросов; оставляем поведение прежним: если нет ни login ни publicId — пробуем /api/users/profile
        if (!this.publicId && !this.login) {
          try {
            const res = await this.client.get('/api/users/profile');
            const data = res?.data || {};
            this.login = this.login ?? data.login ?? data.username ?? null;
            this.setPublicId(data.publicId ?? data.id ?? data.userId ?? null);
            // computed by getter
          } catch (err) {
            // токен невалиден или запрос упал — чистим
            this.logout();
          }
        }
      }
      this.initialized = true;
    },

    setToken(token) {
      if (!token) return this.logout();
      this.token = token;
      localStorage.setItem(TOKEN_KEY, token);
      this.setAuthToken(token);

      const payload = this.decodeJwtPayload(token);
      this.applyPayload(payload);
      // authentication state derived by getter
    },

    logout() {
      this.token = null;
      this.login = null;
      this.publicId = null;
      // computed by getter
      localStorage.removeItem(TOKEN_KEY);
      this.setAuthToken(null);
    },

    /**
     * helper: attempt to fetch /api/users/me and populate publicId (and login if missing)
     * returns normalized id string or null
     */
    async fetchUserId() {
      if (this.publicId) return this.publicId;
      try {
        const res = await this.client.get('/api/users/profile');
        const data = res?.data || {};
        // preserve login if already set
        this.login = this.login ?? data.login ?? data.username ?? null;
        // try several possible ID fields returned by backend
        const id =
          data.publicId ?? data.public_id ?? data.id ?? data.userId ?? null;
        this.setPublicId(id);
        return this.publicId;
      } catch {
        return null;
      }
    }
  }
});


// frontend/src/stores/auth.js
/*import { defineStore } from 'pinia';
import axios from 'axios';

const BACKEND_BASE = 'https://localhost:7145';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    login: null,
    isAuthenticated: false,
    initialized: false,
    api: axios.create({ baseURL: BACKEND_BASE, headers: { 'Content-Type': 'application/json' } })
  }),
  actions: {
    decodeJwtPayload(token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(payload).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(json);
      } catch {
        return null;
      }
    },
    setAuthHeader(token) {
      if (token) this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      else delete this.api.defaults.headers.common['Authorization'];
    },
    async init() {
      if (this.initialized) return;
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        this.setAuthHeader(token);
        const payload = this.decodeJwtPayload(token);
        if (payload && payload.login) {
          this.login = payload.login;
          this.isAuthenticated = true;
        } else {
          // fallback: try fetch profile
          try {
            const res = await this.api.get('/api/users/me');
            this.login = res.data.login;
            this.isAuthenticated = true;
          } catch {
            this.logout();
          }
        }
      }
      this.initialized = true;
    },
    setToken(token) {
      if (!token) return this.logout();
      this.token = token;
      localStorage.setItem('token', token);
      this.setAuthHeader(token);
      const payload = this.decodeJwtPayload(token);
      this.login = payload?.login ?? null;
      this.isAuthenticated = !!this.login;
    },
    logout() {
      this.token = null;
      this.login = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      this.setAuthHeader(null);
    }
  }
});*/
// src/stores/authStore.js
// src/stores/authStore.js
import { defineStore } from 'pinia';
import { apiClient } from '@/api/apiClient';
import { TOKEN_KEY as CONFIG_TOKEN_KEY } from '@/config/apiConfig';

const TOKEN_KEY = CONFIG_TOKEN_KEY || 'auth_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    username: null,
    publicId: null,           // явное имя — publicId (numeric)
    isAuthenticated: false,
    initialized: false,
    client: apiClient
  }),
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
      if (!id) {
        this.publicId = null;
        return;
      }
      const n = Number(id);
      this.publicId = Number.isFinite(n) && n > 0 ? String(Math.trunc(n)) : null;
    },

    async init() {
      if (this.initialized) return;
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        this.token = token;
        this.setAuthToken(token);

        const payload = this.decodeJwtPayload(token);
        // извлекаем username и public_id из payload (public_id — приоритет)
        this.username = payload?.login ?? payload?.username ?? null;
        // поддерживаем разные имена claim'а: public_id, publicId, sub/id fallback
        const pid = payload?.public_id ?? payload?.publicId ?? payload?.publicId ?? null;
        if (pid) {
          this.setPublicId(pid);
        } else {
          // fallback на стандартные поля
          const sub = payload?.sub ?? payload?.id ?? payload?.userId ?? null;
          this.setPublicId(sub);
        }

        this.isAuthenticated = !!(this.publicId || this.username);

        // если publicId/username не извлеклись из токена — можно опционально запросить /api/users/me
        // но лучше избегать лишних запросов; оставляем поведение прежним: если нет ни username ни publicId — пробуем /api/users/me
        if (!this.publicId && !this.username) {
          try {
            const res = await this.client.get('/api/users/me');
            const data = res?.data || {};
            this.username = this.username ?? data.login ?? data.username ?? null;
            this.setPublicId(data.publicId ?? data.id ?? data.userId ?? null);
            this.isAuthenticated = !!(this.publicId || this.username);
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
      this.username = payload?.login ?? payload?.username ?? null;
      const pid = payload?.public_id ?? payload?.publicId ?? payload?.publicId ?? null;
      if (pid) this.setPublicId(pid);
      else {
        const sub = payload?.sub ?? payload?.id ?? payload?.userId ?? null;
        this.setPublicId(sub);
      }
      this.isAuthenticated = !!(this.publicId || this.username);
    },

    logout() {
      this.token = null;
      this.username = null;
      this.publicId = null;
      this.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
      this.setAuthToken(null);
    }
  }
});


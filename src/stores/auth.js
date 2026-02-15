// frontend/src/stores/auth.js
import { defineStore } from 'pinia';
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
});

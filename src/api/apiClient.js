///src/api/apiClient.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'https://localhost:7145' : 'https://adportal.runasp.net/');

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// global 401 interceptor: logout user and redirect to login
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const auth = useAuthStore();
      try { auth.logout(); } catch {}
      // router may not be ready during early import, use setTimeout
      setTimeout(() => {
        router.replace({ name: 'login' });
      });
    }
    return Promise.reject(error);
  }
);

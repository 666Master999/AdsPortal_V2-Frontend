/**
 * @file Axios API клиент с глобальной обработкой ошибок
 * 
 * Особенности:
 * - Глобальный обработчик 401 ошибок (логаут при истечении токена)
 * - Автоматическое добавление Authorization header
 * - Нормализованная обработка ошибок
 */

import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/config/apiConfig';

/**
 * Создаём axios instance с базовой конфигурацией
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Глобальный interceptor для обработки 401 ошибок
 * Автоматически логирует пользователя при истечении токена
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Dynamic import to avoid circular dependency
      (async () => {
        try {
          const { useAuthStore } = await import('@/stores/authStore');
          const { default: router } = await import('@/router');
          
          const auth = useAuthStore();
          try {
            auth.logout();
          } catch (err) {
            console.error('Error during logout:', err);
          }

          // Используем setTimeout чтобы router был инициализирован
          setTimeout(() => {
            try {
              router.replace({ name: 'login' });
            } catch (err) {
              console.error('Error redirecting to login:', err);
            }
          }, 100);
        } catch (err) {
          console.error('Error in 401 handler:', err);
        }
      })();
    }

    return Promise.reject(error);
  }
);

/**
 * Расширяем axios client дополнительными методами для типизации
 */
export const apiService = {
  /**
   * GET запрос с типизацией
   */
  get: <T = any>(url: string, config?: any) =>
    apiClient.get<T>(url, config),

  /**
   * POST запрос с типизацией
   */
  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config),

  /**
   * PUT запрос с типизацией
   */
  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config),

  /**
   * PATCH запрос с типизацией
   */
  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config),

  /**
   * DELETE запрос с типизацией
   */
  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete<T>(url, config)
};

export default apiClient;

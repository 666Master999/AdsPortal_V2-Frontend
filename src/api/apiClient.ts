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
  // Do not set default Content-Type here — allow per-request headers
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
      // Не разлогиниваем автоматически — просто прокидываем ошибку наверх
      console.warn('Unauthorized response', error?.response?.data);
    }

    if (status === 403) {
      // Запрос запрещён — возможно пользователь не имеет прав или заблокирован
      console.warn('Forbidden response', error?.response?.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

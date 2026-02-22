/**
 * @file Сервис аутентификации
 * Управляет запросами к backend для входа, регистрации и обновления токена
 */

import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import type { AuthResponse } from '@/types';

/**
 * Payload для регистрации пользователя
 */
export interface RegisterPayload {
  /** Желаемый логин */
  login: string;
  /** Пароль */
  password: string;
  /** Email (опционально) */
  email?: string;
}

/**
 * Payload для входа пользователя
 */
export interface LoginPayload {
  /** Логин */
  login: string;
  /** Пароль */
  password: string;
  /** Запомнить меня (опционально) */
  rememberMe?: boolean;
}

/**
 * Регистрирует нового пользователя
 * 
 * @param payload - Данные для регистрации
 * @returns Ответ от сервера с токеном и профилем пользователя
 * 
 * @throws { AxiosError } При ошибке от сервера (validation errors, conflict и т.д.)
 * 
 * @example
 * ```ts
 * try {
 *   const response = await registerUser({
 *     login: 'newuser',
 *     password: 'SecurePass123'
 *   });
 *   
 *   const token = response.data.token;
 *   console.log('Успешная регистрация', token);
 * } catch (error) {
 *   console.error('Ошибка регистрации:', error.response?.data?.message);
 * }
 * ```
 */
export async function registerUser(
  payload: RegisterPayload
): Promise<AxiosResponse<AuthResponse>> {
  return apiClient.post(API_ENDPOINTS.AUTH_REGISTER, payload);
}

/**
 * Входит в систему с логином и паролем
 * 
 * @param payload - Данные для входа
 * @returns Ответ от сервера с JWT токеном
 * 
 * @throws { AxiosError } При ошибке аутентификации (invalid credentials, locked account и т.д.)
 * 
 * @example
 * ```ts
 * try {
 *   const response = await loginUser({
 *     login: 'myuser',
 *     password: 'MyPassword123'
 *   });
 *   
 *   const token = response.data.token;
 *   // Сохраняем токен в localStorage и обновляем header
 *   localStorage.setItem('auth_token', token);
 * } catch (error) {
 *   if (error.response?.status === 401) {
 *     console.error('Неверные учётные данные');
 *   }
 * }
 * ```
 */
export async function loginUser(
  payload: LoginPayload
): Promise<AxiosResponse<AuthResponse>> {
  return apiClient.post(API_ENDPOINTS.AUTH_LOGIN, payload);
}

/**
 * Обновляет JWT токен используя refresh token или текущую сессию
 * 
 * @returns Новый JWT токен от сервера
 * 
 * @throws { AxiosError } При невозможности обновить токен
 * 
 * @example
 * ```ts
 * if (isTokenExpired(token)) {
 *   try {
 *     const response = await refreshToken();
 *     const newToken = response.data.token;
 *     auth.setToken(newToken);
 *   } catch (error) {
 *     // Нужно заново войти
 *     auth.logout();
 *     router.push({ name: 'login' });
 *   }
 * }
 * ```
 */
export async function refreshToken(): Promise<AxiosResponse<AuthResponse>> {
  return apiClient.post(API_ENDPOINTS.AUTH_REFRESH, {});
}

/**
 * Логирует пользователя (удаляет session на сервере)
 * 
 * @returns Ответ от сервера
 * 
 * @example
 * ```ts
 * await logoutUser();
 * auth.logout(); // Очищаем localStorage
 * router.push({ name: 'login' });
 * ```
 */
export async function logoutUser(): Promise<AxiosResponse> {
  return apiClient.post(API_ENDPOINTS.AUTH_LOGOUT, {});
}

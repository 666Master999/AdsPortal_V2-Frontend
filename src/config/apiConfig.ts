/**
 * @file Конфигурация API клиента
 * Содержит базовые URL и настройки для всех API запросов
 */

/**
 * Ключ для хранения токена в localStorage
 */
export const TOKEN_KEY = 'auth_token' as const;

/**
 * Базовый URL API в зависимости от окружения
 * - DEV: https://localhost:7145 (локальный backend)
 * - PROD: https://adportal.runasp.net/ (production backend)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? 'https://localhost:7145' : 'https://adportal.runasp.net/');

/**
 * Таймаут для всех API запросов (в мс)
 */
export const API_TIMEOUT = 30000;

/**
 * Пути основных endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  HEALTH: '/api/health',

  // User endpoints
  USERS_PROFILE: '/api/users/profile',
  USERS_ME: '/api/users/me',
  USERS_GET: (id: string | number) => `/api/users/${id}`,
  USERS_UPDATE: '/api/users/profile',
  USERS_PROFILE_PUBLIC: (id: string | number) => `/api/users/profiles/${id}`,
  USERS_AVATAR: '/api/users/profile/avatar',
  USERS_CHANGE_PASSWORD: '/api/users/profile/change-password',
  USERS_SEARCH: '/api/users/search',
  USERS_LIST: '/api/users',
  USERS_BLOCK: (id: string | number) => `/api/users/${id}/block`,
  USERS_UNBLOCK: (id: string | number) => `/api/users/${id}/unblock`,

  // Ads endpoints
  ADS_LIST: '/api/ads',
  ADS_CREATE: '/api/ads',
  ADS_GET: (id: string | number) => `/api/ads/${id}`,
  ADS_UPDATE: (id: string | number) => `/api/ads/${id}`,
  ADS_DELETE: (id: string | number) => `/api/ads/${id}`,
  ADS_VISIBILITY: (id: string | number) => `/api/ads/${id}/visibility`, // patch visibility (owner/admin)
  ADS_BY_USER: (userId: string | number) => `/api/ads/user/${userId}`
} as const;

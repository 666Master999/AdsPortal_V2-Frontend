/**
 * @file Утилиты аутентификации
 * Вспомогательные функции для работы с токенами, ошибками и responses от API
 */

import type { AxiosResponse } from 'axios';


/**
 * Извлекает JWT токен из различных форматов ответов сервера
 * Поддерживает несколько возможных форматов: token, accessToken, data.token и т.д.
 * 
 * @param response - Ответ от axios
 * @returns JWT токен или null, если токен не найден
 * 
 * @example
 * ```ts
 * const response = await api.post('/auth/login', { ... });
 * const token = extractToken(response);
 * ```
 */
export function extractToken(response: AxiosResponse<any> | any): string | null {
  if (!response?.data) return null;

  return (
    response.data.token ||
    response.data.accessToken ||
    response.data.data?.token ||
    response.data.data?.accessToken ||
    null
  );
}

/**
 * Извлекает публичный ID пользователя из ответа сервера
 * Поддерживает несколько форматов: publicId, public_id, id и т.д.
 * 
 * @param response - Ответ от axios
 * @returns Публичный ID или null
 * 
 * @example
 * ```ts
 * const response = await api.post('/auth/login', { ... });
 * const publicId = extractPublicId(response);
 * ```
 */
export function extractPublicId(response: AxiosResponse<any> | any): number | string | null {
  if (!response?.data) return null;

  return (
    response.data.publicId ||
    response.data.public_id ||
    response.data.id ||
    response.data.user?.publicId ||
    response.data.user?.public_id ||
    response.data.user?.id ||
    response.data.data?.publicId ||
    response.data.data?.public_id ||
    response.data.data?.id ||
    null
  );
}

/**
 * Нормализует сообщение об ошибке из различных источников
 * Поддерживает ошибки от axios, TypeError, собственные сообщения
 * 
 * @param error - Ошибка любого типа
 * @param defaultMessage - Сообщение по умолчанию, если не удаётся извлечь
 * @returns Нормализованное сообщение об ошибке
 * 
 * @example
 * ```ts
 * try {
 *   await api.post('/auth/login', { ... });
 * } catch (err) {
 *   const message = getErrorMessage(err, 'Ошибка входа');
 *   console.error(message);
 * }
 * ```
 */
export function getErrorMessage(error: any, defaultMessage: string = 'Ошибка'): string {
  // Если ошибка null/undefined
  if (!error) {
    return defaultMessage;
  }

  // Если ошибка уже строка
  if (typeof error === 'string') {
    return error;
  }

  const data = error.response?.data;

  // Axios response error
  if (data?.message) {
    return String(data.message);
  }

  // Backend may return { error: '...'}
  if (data?.error) {
    return String(data.error);
  }

  // Validation errors map: { errors: { field: msg } }
  if (data?.errors && typeof data.errors === 'object') {
    return formatValidationErrors(data.errors as Record<string, string | string[]>);
  }

  // Axios/fetch error
  if (error.message) {
    return String(error.message);
  }

  // Fallback
  return defaultMessage;
}

/**
 * Проверяет, имеет ли пользователь доступ к ресурсу
 * Сравнивает ID пользователя с ID из пути/параметра
 * 
 * @param userId - ID текущего пользователя
 * @param resourceOwnerId - ID владельца ресурса
 * @returns true если пользователь имеет доступ
 * 
 * @example
 * ```ts
 * if (checkOwnership(user.id, profile.id)) {
 *   // Может редактировать
 * }
 * ```
 */
export function checkOwnership(
  userId: string | number | null | undefined,
  resourceOwnerId: string | number | null | undefined
): boolean {
  if (!userId || !resourceOwnerId) {
    return false;
  }

  return String(userId) === String(resourceOwnerId);
}

/**
 * Логирует ошибку с префиксом в консоль для отладки
 * 
 * @param error - Ошибка для логирования
 * @param prefix - Префикс сообщения (опционально)
 * 
 * @example
 * ```ts
 * try {
 *   // ...
 * } catch (err) {
 *   logError(err, '[Auth]');
 * }
 * ```
 */
export function logError(error: any, prefix: string = ''): void {
  const message = `${prefix} ${getErrorMessage(error)}`.trim();
  console.error(message, error);
}

/**
 * Проверяет, действителен ли JWT токен (не истёк ли срок)
 * 
 * @param token - JWT токен
 * @returns true если токен ещё действителен
 * 
 * @example
 * ```ts
 * if (isTokenExpired(token)) {
 *   // Нужно обновить токен
 * }
 * ```
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Декодируем payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Проверяем exp (expiration time в секундах)
    const exp = payload.exp;
    if (!exp) return false; // Если нет exp, считаем валидным

    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch {
    return true;
  }
}

/**
 * Форматирует ошибки валидации для отображения пользователю
 * 
 * @param errors - Объект с ошибками валидации
 * @returns Строка с форматированными ошибками
 * 
 * @example
 * ```ts
 * const errors = { login: 'Required', password: 'Too short' };
 * const message = formatValidationErrors(errors);
 * // "login: Required. password: Too short."
 * ```
 */
export function formatValidationErrors(errors: Record<string, string | string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => {
      const msgs = Array.isArray(messages) ? messages : [messages];
      return `${field}: ${msgs.join(', ')}`;
    })
    .join('. ');
}

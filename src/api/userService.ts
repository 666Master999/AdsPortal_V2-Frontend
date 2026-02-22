/**
 * @file Сервис для работы с пользователями
 * 
 * Управляет операциями:
 * - Получение информации о пользователе
 * - Поиск пользователей
 * - Получение аватара пользователя
 */

import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import type { UserProfile } from '@/types';

/**
 * Параметры для поиска пользователей
 */
export interface SearchUsersOptions {
  /** Поисковый запрос */
  q?: string;
  /** Страница (для пагинации) */
  page?: number;
  /** Количество результатов на странице */
  limit?: number;
}

/**
 * Получает информацию о текущем пользователе (/api/users/me endpoint)
 * 
 * @returns Профиль текущего пользователя
 * 
 * @throws { AxiosError } Если пользователь не авторизован
 * 
 * @example
 * ```ts
 * const response = await fetchCurrentUser();
 * console.log('ID:', response.data.id);
 * ```
 */
export async function fetchCurrentUser(): Promise<AxiosResponse<UserProfile>> {
  return apiClient.get('/api/users/me');
}

/**
 * Получает информацию о пользователе по ID
 * 
 * @param id - ID пользователя
 * @returns Профиль пользователя
 * 
 * @throws { AxiosError } Если пользователь не найден
 * 
 * @example
 * ```ts
 * const response = await fetchUserById(123);
 * console.log(response.data.login);
 * ```
 */
export async function fetchUserById(id: string | number): Promise<AxiosResponse<UserProfile>> {
  return apiClient.get(`/api/users/${id}`);
}

/**
 * Ищет пользователей по логину или другим параметрам
 * 
 * @param options - Параметры поиска
 * @returns Массив найденных пользователей
 * 
 * @example
 * ```ts
 * const response = await searchUsers({ q: 'john', limit: 10 });
 * console.log('Найдено пользователей:', response.data.length);
 * ```
 */
export async function searchUsers(
  options: SearchUsersOptions = {}
): Promise<AxiosResponse<UserProfile[]>> {
  return apiClient.get('/api/users/search', { params: options });
}

/**
 * Получает список всех пользователей (для администратора)
 * 
 * @param page - Номер страницы
 * @param limit - Количество записей на странице
 * @returns Список пользователей
 */
export async function listUsers(
  page: number = 1,
  limit: number = 20
): Promise<AxiosResponse<UserProfile[]>> {
  return apiClient.get('/api/users', { params: { page, limit } });
}

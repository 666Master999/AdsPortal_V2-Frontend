/**
 * @file Сервис для работы с профилями пользователей
 * 
 * Управляет операциями:
 * - Получение своего профиля
 * - Получение профиля другого пользователя
 * - Обновление профиля
 * - Загрузка аватара
 * - Смена пароля
 */

import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import type { UserProfile } from '@/types';

/**
 * Payload для обновления профиля
 */
export interface UpdateProfilePayload {
  /** Email адрес */
  email?: string;
  /** Описание профиля */
  description?: string;
  /** Имя пользователя */
  name?: string;
  /** Телефон */
  phone?: string;
  /** Город */
  city?: string;
}

/**
 * Payload для смены пароля
 */
export interface ChangePasswordPayload {
  /** Текущий пароль */
  currentPassword: string;
  /** Новый пароль */
  newPassword: string;
  /** Подтверждение нового пароля (опционально) */
  confirmPassword?: string;
}

/**
 * Получает профиль текущего аутентифицированного пользователя
 * 
 * @param options - Дополнительные опции (signal для отмены)
 * @returns Профиль текущего пользователя
 * 
 * @throws { AxiosError } Если пользователь не авторизован (401)
 * 
 * @example
 * ```ts
 * const response = await fetchMyProfile();
 * console.log(response.data.email);
 * ```
 */
export async function fetchMyProfile(options?: { signal?: AbortSignal }): Promise<AxiosResponse<UserProfile>> {
  return apiClient.get(API_ENDPOINTS.USERS_PROFILE, options);
}

/**
 * Получает публичный профиль пользователя по ID
 * Может просматривать любой пользователь (не требует авторизации)
 * 
 * @param id - ID пользователя или публичный ID
 * @returns Публичный профиль пользователя
 * 
 * @throws { AxiosError } Если пользователь не найден (404)
 * 
 * @example
 * ```ts
 * const response = await fetchUserProfile(123);
 * console.log(response.data.login);
 * ```
 */
export async function fetchUserProfile(
  id: string | number,
  options?: { signal?: AbortSignal }
): Promise<AxiosResponse<UserProfile>> {
  return apiClient.get(API_ENDPOINTS.USERS_PROFILE_PUBLIC(id), options);
}

/**
 * Обновляет данные профиля текущего пользователя
 * 
 * @param data - Данные для обновления
 * @returns Обновленный профиль
 * 
 * @throws { AxiosError } При ошибке валидации или конфликте данных
 * 
 * @example
 * ```ts
 * const response = await updateProfile({
 *   email: 'newemail@example.com',
 *   description: 'My new bio'
 * });
 * ```
 */
export async function updateProfile(
  data: UpdateProfilePayload
): Promise<AxiosResponse<UserProfile>> {
  return apiClient.put(API_ENDPOINTS.USERS_UPDATE, data);
}

/**
 * Загружает/обновляет аватар пользователя
 * 
 * @param imageFile - Файл изображения для загрузки
 * @returns Ответ с URL нового аватара
 * 
 * @throws { AxiosError } Если файл не является изображением или слишком большой
 * 
 * @example
 * ```ts
 * const fileInput = document.querySelector('input[type="file"]');
 * const response = await uploadAvatar(fileInput.files[0]);
 * console.log('Аватар загружен:', response.data.avatarUrl);
 * ```
 */
export async function uploadAvatar(imageFile: File): Promise<AxiosResponse<{ avatarUrl: string }>> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return apiClient.post(API_ENDPOINTS.USERS_AVATAR, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

/**
 * Меняет пароль текущего пользователя
 * 
 * @param data - Текущий и новый пароль
 * @returns Ответ от сервера
 * 
 * @throws { AxiosError } Если текущий пароль неверный
 * 
 * @example
 * ```ts
 * await changePassword({
 *   currentPassword: 'OldPass123',
 *   newPassword: 'NewPass123',
 *   confirmPassword: 'NewPass123'
 * });
 * console.log('Пароль успешно изменён');
 * ```
 */
export async function changePassword(
  data: ChangePasswordPayload
): Promise<AxiosResponse> {
  return apiClient.post(API_ENDPOINTS.USERS_CHANGE_PASSWORD, data);
}

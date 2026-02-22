/**
 * @file Сервис для работы с объявлениями (Ads)
 * 
 * Управляет операциями:
 * - Создание объявлений
 * - Получение списка/одного объявления
 * - Удаление объявлений
 */

import { AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import type { Advertisement } from '@/types';

/**
 * Payload для создания объявления
 */
export interface CreateAdPayload {
  /** Тип объявления: "Sell" или "Buy" */
  type: 'Sell' | 'Buy';
  /** Заголовок объявления */
  title: string;
  /** Описание объявления (опционально) */
  description?: string;
  /** Цена */
  price: number;
  /** Изображение (опционально) */
  image?: File;
}

/**
 * Параметры для фильтрации списка объявлений
 */
export interface FetchAdsOptions {
  /** Страница (для пагинации) */
  page?: number;
  /** Количество объявлений на странице */
  limit?: number;
  /** Тип объявления для фильтра */
  type?: 'Sell' | 'Buy';
  /** Поле для сортировки */
  sortBy?: 'date' | 'price';
  /** Порядок сортировки */
  order?: 'asc' | 'desc';
}

/**
 * Создаёт новое объявление с опциональным изображением
 * 
 * @param data - Данные объявления
 * @returns Ответ с созданным объявлением и URL изображения
 * 
 * @example
 * ```ts
 * const response = await createAd({
 *   type: 'Sell',
 *   title: 'iPhone 13',
 *   description: 'Good condition',
 *   price: 500,
 *   image: fileInput.files[0]
 * });
 * ```
 */
export async function createAd(
  data: CreateAdPayload
): Promise<AxiosResponse<Advertisement>> {
  const formData = new FormData();
  
  formData.append('Type', data.type);
  formData.append('Title', data.title);
  
  if (data.description) {
    formData.append('Description', data.description);
  }
  
  formData.append('Price', String(data.price));
  
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiClient.post('/api/ads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

/**
 * Получает список всех объявлений с опциональной фильтрацией
 * 
 * @param options - Параметры фильтрации и пагинации
 * @returns Массив объявлений
 * 
 * @example
 * ```ts
 * const response = await fetchAds({ 
 *   type: 'Sell', 
 *   sortBy: 'date',
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function fetchAds(
  options: FetchAdsOptions = {}
): Promise<AxiosResponse<Advertisement[]>> {
  return apiClient.get('/api/ads', { params: options });
}

/**
 * Получает одно объявление по ID
 * 
 * @param id - ID объявления
 * @returns Объект объявления с полной информацией
 * 
 * @example
 * ```ts
 * const response = await fetchAd(123);
 * console.log(response.data.title);
 * ```
 */
export async function fetchAd(id: string | number): Promise<AxiosResponse<Advertisement>> {
  return apiClient.get(`/api/ads/${id}`);
}

/**
 * Удаляет объявление (может удалить только владелец)
 * 
 * @param id - ID объявления для удаления
 * @returns Ответ от сервера
 * 
 * @throws { AxiosError } Если пользователь не является владельцем
 * 
 * @example
 * ```ts
 * try {
 *   await deleteAd(123);
 *   console.log('Объявление удалено');
 * } catch (err) {
 *   console.error('Нет прав для удаления');
 * }
 * ```
 */
export async function deleteAd(id: string | number): Promise<AxiosResponse> {
  return apiClient.delete(`/api/ads/${id}`);
}

/**
 * Обновляет объявление (может обновить только владелец)
 * 
 * @param id - ID объявления
 * @param data - Новые данные объявления
 * @returns Обновленное объявление
 * 
 * @throws { AxiosError } Если пользователь не является владельцем
 */
export async function updateAd(
  id: string | number,
  data: Partial<CreateAdPayload>
): Promise<AxiosResponse<Advertisement>> {
  return apiClient.put(`/api/ads/${id}`, data);
}

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
import { API_ENDPOINTS } from '@/config/apiConfig';
import type { Advertisement } from '@/types';

/**
 * Payload для создания объявления
 */
export interface CreateAdPayload {
  /** Тип объявления: 0=Sell,1=Buy,2=Service */
  type: number;
  /** Заголовок объявления */
  title: string;
  /** Описание объявления (опционально) */
  description?: string;
  /** Цена (nullable for negotiable) */
  price?: number | null;
  /** Признак "Договорная" */
  isNegotiable?: boolean;
  /** Изображения: up to 10 files, order matters (first = main) */
  images?: File[];
}

/**
 * Параметры для фильтрации списка объявлений
 */
export interface FetchAdsOptions {
  /** Страница (для пагинации) — временно не используем */
  page?: number;
  /** Количество объявлений на странице — временно не используем */
  limit?: number;
  /** Тип объявления для фильтра: 0|1 or 'Sell'|'Buy' */
  type?: number | 'Sell' | 'Buy' | string;
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

  // Normalize and append type as numeric string (backend expects 0|1|2)
  let typeValue: number | null = null;
  if (typeof data.type === 'number') typeValue = data.type;
  else if (data.type === 'Sell') typeValue = 0;
  else if (data.type === 'Buy') typeValue = 1;
  else {
    const n = Number(data.type);
    if (!Number.isNaN(n)) typeValue = n;
  }
  if (typeValue !== null) formData.append('type', String(typeValue));
  formData.append('title', data.title);

  if (data.description) {
    formData.append('description', data.description);
  }

  if (data.price !== undefined && data.price !== null) {
    formData.append('price', String(data.price));
  }

  if (typeof data.isNegotiable === 'boolean') {
    formData.append('isNegotiable', data.isNegotiable ? 'true' : 'false');
  }

  if (data.images && data.images.length) {
    // limit to 10 — order matters, backend treats first as main
    data.images.slice(0, 10).forEach((img) => formData.append('images', img));
  }

  return apiClient.post(API_ENDPOINTS.ADS_CREATE, formData, {
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
  // Some backend implementations reject requests containing `type` query
  // (405). To be resilient, request the list without `type` and apply
  // optional filtering on the client side.
  // Send pagination params to server (server supports `page` and `limit`).
  const params: any = {};
  if (options.page !== undefined) params.page = options.page;
  if (options.limit !== undefined) params.limit = options.limit;
  if (options.sortBy) params.sortBy = options.sortBy;
  if (options.order) params.order = options.order;

  // Normalize type to numeric if provided
  if (options.type !== undefined) {
    if (options.type === 'Sell') params.type = 0;
    else if (options.type === 'Buy') params.type = 1;
    else {
      const n = Number(options.type);
      if (!Number.isNaN(n)) params.type = n;
    }
  }

  const res = await apiClient.get(API_ENDPOINTS.ADS_LIST, { params });
  return res;
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
  return apiClient.get(API_ENDPOINTS.ADS_GET(id));
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
  return apiClient.delete(API_ENDPOINTS.ADS_DELETE(id));
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
  return apiClient.put(API_ENDPOINTS.ADS_UPDATE(id), data);
}

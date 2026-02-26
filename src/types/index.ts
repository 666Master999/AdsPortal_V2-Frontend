/**
 * @file Global type definitions for the AdsPortal V2 frontend
 */

// Re-export ad-specific types for convenience
export { AdType, AD_TYPE_LABELS } from '@/types/ad';
export type { AdImage, AdFormData, AdSubmitPayload } from '@/types/ad';

/**
 * Пользователь (по результатам аутентификации)
 */
export interface AuthPayload {
  /** Логин пользователя */
  login?: string;
  /** Альтернативное имя пользователя */
  username?: string;
  /** Публичный ID пользователя */
  public_id?: number | string;
  /** Публичный ID пользователя (альтернативный формат) */
  publicId?: number | string;
  /** ID пользователя из токена */
  id?: number | string;
  /** ID пользователя (альтернативный формат) */
  userId?: number | string;
  /** Subject (из JWT) */
  sub?: string;

  /** Роли пользователя (например, ['Admin']) */
  roles?: string[];
  /** Флаг блокировки */
  isBlocked?: boolean;
}

/**
 * Состояние аутентификации
 */
export interface AuthState {
  /** JWT токен доступа */
  token: string | null;
  /** Логин пользователя */
  login: string | null;
  /** Публичный ID пользователя */
  publicId: number | null;
  /** Роли (например ['Admin']) */
  roles?: string[];
  /** Признак блокировки */
  isBlocked?: boolean;
  /** Флаг инициализации состояния */
  initialized: boolean;
}

/**
 * Ответ API на запрос регистрации/входа
 */
export interface AuthResponse {
  /** JWT токен */
  token?: string;
  /** Токен доступа */
  accessToken?: string;
  /** Данные пользователя */
  user?: AuthPayload;
  /** Публичный ID (если возвращается отдельно) */
  publicId?: number | string;
}

/**
 * Профиль пользователя
 */
export interface UserProfile {
  /** Публичный ID */
  id: number;
  publicId?: number;
  public_id?: number;
  /** Логин */
  login: string;
  /** Email */
  email?: string | null;
  /** Телефон */
  phone?: string | null;
  /** Описание профиля */
  description?: string | null;
  /** Аватар URL */
  avatar?: string | null;
  avatarUrl?: string | null;
  /** Дата создания */
  createdAt?: string | null;

  /** Признак, что пользователь заблокирован (только админ) */
  isBlocked?: boolean;
  /** Список ролей пользователя (может содержать 'Admin') */
  roles?: string[];
}

/**
 * Объявление (Ad)
 */
export interface Advertisement {
  /** ID объявления */
  id: number;
  /** Заголовок */
  title: string;
  /** Описание */
  description?: string | null;
  /** Цена */
  price?: number | null;
  /** Категория */
  category?: string;
  /** Статус ('active' | 'sold' | 'archived'| 'hidden') */
  status?: string;
  /** Является ли объявление видимым (альтернативно) */
  isVisible?: boolean;
  /** Тип объявления: 0=Sell,1=Buy,2=Service */
  type?: number;
  /** Флаг договорной цены */
  isNegotiable?: boolean;
  /** Объявление скрыто */
  isHidden?: boolean;
  /** Объявление удалено */
  isDeleted?: boolean;
  /** ID владельца объявления */
  ownerId?: number;
  /** Логин владельца */
  ownerUserName?: string;
  /** Изображения (список объектов: id, url, isMain, order) */
  images?: AdImageDto[];
  /** Изображения (URL списка, как в API - устарело) */
  imageUrls?: string[];
  /** ID главного изображения (если есть) */
  mainImageId?: number;
  /** Дата создания */
  createdAt: string;
  /** Дата обновления (только в ответе). */
  updatedAt?: string;
}

/**
 * Изображение из бэкенда (AdImageDto)
 */
export interface AdImageDto {
  id: number;
  url: string;
  isMain: boolean;
  order: number;
}

/**
 * Ошибка API
 */
export interface ApiError {
  /** Статус код */
  status: number;
  /** Сообщение об ошибке */
  message: string;
  /** Детали ошибки */
  details?: any;
}

/**
 * Валидационная ошибка
 */
export interface ValidationError {
  /** Название поля */
  field: string;
  /** Сообщение об ошибке */
  message: string;
}

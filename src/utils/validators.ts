/**
 * @file Утилиты валидации для frontend части
 * Содержит функции для проверки данных перед отправкой на backend
 */

export interface ValidationResult {
  /** Флаг валидности */
  isValid: boolean;
  /** Сообщение об ошибке (если невалидно) */
  error?: string;
}

/**
 * Требования для пароля (только длина)
 */
export interface PasswordRequirements {
  /** Минимальная длина */
  minLength: number;
  /** Максимальная длина */
  maxLength: number;
}

/* 
 * Требования:
 * - Минимум: 3 символа
 * - Максимум: 50 символов
 */
const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 3,
  maxLength: 50
};

/**
 * Валидирует логин (только длина: 3-50 символов)
 * @param login - Логин для проверки
 * @returns Объект результата валидации
 * 
 * @example
 * ```ts
 * const result = validateLogin('user123');
 * if (!result.isValid) console.error(result.error);
 * ```
 */
export function validateLogin(login: string | undefined | null): ValidationResult {
  if (!login || typeof login !== 'string') {
    return { isValid: false, error: 'Логин обязателен' };
  }

  const trimmed = login.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Логин должен содержать минимум 3 символа' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Логин не должен содержать более 50 символов' };
  }

  return { isValid: true };
}

/**
 * Валидирует пароль (только длина: 3-50 символов)
 * @param password - Пароль для проверки
 * @param requirements - Требования к паролю (опционально)
 * @returns Объект результата валидации
 * 
 * @example
 * ```ts
 * const result = validatePassword('MyPassword');
 * if (!result.isValid) console.error(result.error);
 * ```
 */
export function validatePassword(
  password: string | undefined | null,
  requirements: Partial<PasswordRequirements> = {}
): ValidationResult {
  const reqs = { ...DEFAULT_PASSWORD_REQUIREMENTS, ...requirements };

  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Пароль обязателен' };
  }

  if (password.length > reqs.maxLength) {
    return {
      isValid: false,
      error: `Пароль не должен содержать более ${reqs.maxLength} символов`
    };
  }

  if (password.length < reqs.minLength) {
    return {
      isValid: false,
      error: `Пароль должен содержать минимум ${reqs.minLength} символов`
    };
  }

  return { isValid: true };
}

/**
 * Валидирует email
 * @param email - Email для проверки
 * @returns Объект результата валидации
 * 
 * @example
 * ```ts
 * const result = validateEmail('user@example.com');
 * if (!result.isValid) console.error(result.error);
 * ```
 */
export function validateEmail(email: string | undefined | null): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email обязателен' };
  }

  const trimmed = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: 'Введите корректный email адрес' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Email не должен содержать более 100 символов' };
  }

  return { isValid: true };
}

/**
 * Валидирует цену объявления
 * @param price - Цена для проверки
 * @returns Объект результата валидации
 */
export function validatePrice(price: number | string | undefined): ValidationResult {
  if (price === undefined || price === null || price === '') {
    return { isValid: false, error: 'Цена обязательна' };
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Цена должна быть числом' };
  }

  if (numPrice < 0) {
    return { isValid: false, error: 'Цена не может быть отрицательной' };
  }

  if (numPrice > 999999999) {
    return { isValid: false, error: 'Цена слишком велика' };
  }

  return { isValid: true };
}

/**
 * Валидирует заголовок объявления
 * @param title - Заголовок для проверки
 * @returns Объект результата валидации
 */
export function validateAdTitle(title: string | undefined | null): ValidationResult {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Заголовок обязателен' };
  }

  const trimmed = title.trim();

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Заголовок должен содержать минимум 5 символов' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Заголовок не должен содержать более 100 символов' };
  }

  return { isValid: true };
}

/**
 * Валидирует описание объявления
 * @param description - Описание для проверки
 * @returns Объект результата валидации
 */
export function validateDescription(description: string | undefined | null): ValidationResult {
  if (!description || typeof description !== 'string') {
    return { isValid: false, error: 'Описание обязательно' };
  }

  const trimmed = description.trim();

  if (trimmed.length < 10) {
    return { isValid: false, error: 'Описание должно содержать минимум 10 символов' };
  }

  if (trimmed.length > 3000) {
    return { isValid: false, error: 'Описание не должно содержать более 3000 символов' };
  }

  return { isValid: true };
}

/**
 * Валидирует группу данных для регистрации
 * @param login - Логин
 * @param password - Пароль
 * @param passwordConfirm - Подтверждение пароля
 * @returns Объект результата валидации
 */
export function validateRegistration(
  login: string | null | undefined,
  password: string | null | undefined,
  passwordConfirm: string | null | undefined
): ValidationResult {
  const loginResult = validateLogin(login);
  if (!loginResult.isValid) return loginResult;

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) return passwordResult;

  if (password !== passwordConfirm) {
    return { isValid: false, error: 'Пароли не совпадают' };
  }

  return { isValid: true };
}

/**
 * Валидирует данные для создания объявления
 * @param title - Заголовок
 * @param description - Описание
 * @param price - Цена
 * @returns Объект результата валидации
 */
export function validateCreateAd(
  title: string | null | undefined,
  description: string | null | undefined,
  price: number | string | undefined
): ValidationResult {
  const titleResult = validateAdTitle(title);
  if (!titleResult.isValid) return titleResult;

  const descResult = validateDescription(description);
  if (!descResult.isValid) return descResult;

  const priceResult = validatePrice(price);
  if (!priceResult.isValid) return priceResult;

  return { isValid: true };
}

/**
 * @file Утилиты для форматирования
 * 
 * Функции для преобразования данных в user-friendly формат
 */

/**
 * Форматирует дату/время в строку в локали пользователя
 * 
 * @param value - Дата в различных форматах (ISO string, Date object, numero и т.д.)
 * @returns Отформатированная дата или '—' если некорректная дата
 * 
 * @example
 * ```ts
 * formatDate('2025-02-22T10:30:00Z');     // "22. 2. 2025, 10:30:00"
 * formatDate(new Date());                  // "22. 2. 2025, 10:30:00"
 * formatDate(null);                        // "—"
 * ```
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

/**
 * Форматирует цену в строку с валютой
 * 
 * @param price - Цена (число)
 * @param currency - Код валюты (по умолчанию RUB)
 * @returns Отформатированная цена
 * 
 * @example
 * ```ts
 * formatPrice(1000);           // "1 000,00 ₽"
 * formatPrice(500.5);          // "500,50 ₽"
 * formatPrice(100, 'USD');     // "$100.00"
 * ```
 */
export function formatPrice(price: number | null | undefined, currency: string = 'RUB'): string {
  if (price == null) return '—';
  
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  } catch {
    return String(price);
  }
}

/**
 * Форматирует номер телефона в читаемый формат
 * 
 * @param phone - Номер телефона (только цифры)
 * @returns Отформатированный номер или исходное значение
 * 
 * @example
 * ```ts
 * formatPhone('79999999999');  // "+7 (999) 999-99-99"
 * formatPhone('9999999999');   // "(999) 999-99-99"
 * ```
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  
  // Удаляем всё кроме цифр
  const cleaned = phone.replace(/\D/g, '');
  
  // Форматируем для российского номера
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  
  // Форматируем для 10 цифр
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
  }
  
  return phone;
}

/**
 * Обрезает длинный текст с многоточием
 * 
 * @param text - Исходный текст
 * @param maxLength - Максимальная длина (по умолчанию 50)
 * @returns Обрезанный текст с многоточием или исходный если короче
 * 
 * @example
 * ```ts
 * truncateText('Очень длинный текст описания', 10); // "Очень dług..."
 * truncateText('Короткий', 20);                      // "Короткий"
 * ```
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '—';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Преобразует текст в начальный регистр (капитализирует первую букву)
 * 
 * @param text - Исходный текст
 * @returns Текст с заглавной первой буквой
 * 
 * @example
 * ```ts
 * capitalize('hello world');  // "Hello world"
 * capitalize('iPhone');       // "IPhone"
 * ```
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '—';
  
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Форматирует количество просмотров/лайков в читаемый формат
 * 
 * @param count - Количество
 * @returns Форматированное количество
 * 
 * @example
 * ```ts
 * formatCount(1000);      // "1K"
 * formatCount(1500000);   // "1.5M"
 * formatCount(42);        // "42"
 * ```
 */
export function formatCount(count: number | null | undefined): string {
  if (count == null) return '0';
  
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  return String(count);
}

/**
 * Форматирует относительное время (например "2 часа назад")
 * 
 * @param date - Дата события
 * @returns Строка с относительным временем
 * 
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 5 * 60_000));  // "5 минут назад"
 * formatRelativeTime(new Date(Date.now() - 2 * 3600_000)); // "2 часа назад"
 * ```
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'только что';
  }
  
  if (diffMin < 60) {
    return `${diffMin} ${declension(diffMin, 'минуту', 'минуты', 'минут')} назад`;
  }
  
  if (diffHour < 24) {
    return `${diffHour} ${declension(diffHour, 'час', 'часа', 'часов')} назад`;
  }
  
  if (diffDay < 7) {
    return `${diffDay} ${declension(diffDay, 'день', 'дня', 'дней')} назад`;
  }
  
  return formatDate(date);
}

/**
 * Вспомогательная функция для правильного склонения слов на русском
 * 
 * @internal
 */
function declension(num: number, one: string, two: string, five: string): string {
  const mod = num % 10;
  const mod100 = num % 100;
  
  if (mod === 1 && mod100 !== 11) return one;
  if (mod >= 2 && mod <= 4 && (mod100 < 10 || mod100 >= 20)) return two;
  return five;
}

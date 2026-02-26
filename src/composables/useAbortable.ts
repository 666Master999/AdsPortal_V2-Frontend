/**
 * @file Composable для выполнения асинхронных запросов с поддержкой отмены
 * 
 * Удобный способ для:
 * - Выполнения асинхронных операций (API запросов)
 * - Отслеживания состояния loading/error
 * - Отмены запроса при размонтировании компонента
 * - Предотвращения утечек памяти и race conditions
 */

import { ref, onBeforeUnmount, Ref } from 'vue';
import { getErrorMessage } from '@/utils/authUtils';

/**
 * Функция для выполнения асинхронной операции
 * Получает AbortSignal для возможности отмены
 */
type AsyncAction<T> = (signal: AbortSignal) => Promise<T>;

/**
 * Результат work useAbortable composable
 */
export interface UseAbortableReturn<T> {
  /** Флаг выполнения операции */
  loading: Ref<boolean>;
  /** Сообщение об ошибке (если произошла) */
  error: Ref<string | null>;
  /** Функция для выполнения асинхронной операции */
  run: (action: AsyncAction<T>) => Promise<T | undefined>;
}

/**
 * Vue composable для выполнения асинхронных запросов с поддержкой отмены
 * 
 * Автоматически:
 * - Управляет loading состоянием
 * - Обрабатывает ошибки и отмену
 * - Отменяет запрос при размонтировании компонента
 * 
 * @param defaultErrorMessage - Сообщение об ошибке по умолчанию
 * @returns Объект с loading, error refs и функцией run
 * 
 * @example
 * ```ts
 * import { useAbortable } from '@/composables/useAbortable';
 * 
 * const { loading, error, run } = useAbortable('Ошибка загрузки');
 * 
 * const fetchData = async () => {
 *   try {
 *     const data = await run(async (signal) => {
 *       const res = await axios.get('/api/data', { signal });
 *       return res.data;
 *     });
 *   } catch (err) {
 *     console.error(error.value);
 *   }
 * };
 * ```
 */
export function useAbortable<T = any>(
  defaultErrorMessage: string = 'Произошла ошибка'
): UseAbortableReturn<T> {
  /** Состояние загрузки */
  const loading = ref(false);

  /** Состояние ошибки */
  const error = ref<string | null>(null);

  /** AbortController для отмены запроса */
  let controller: AbortController | null = null;

  /**
   * Выполняет асинхронную операцию с поддержкой отмены
   * 
   * @param action - Функция которая получает AbortSignal и выполняет запрос
   * @returns Результат операции или undefined если отменена
   * @throws Пробрасывает ошибку чтобы компонент мог на неё реагировать
   */
  const run = async (action: AsyncAction<T>): Promise<T | undefined> => {
    // Отменяем предыдущий запрос если он выполняется
    if (controller) {
      controller.abort();
    }

    // Создаём новый controller для этого запроса
    controller = new AbortController();
    loading.value = true;
    error.value = null;

    try {
      const result = await action(controller.signal);
      return result;
    } catch (err: any) {
      // Игнорируем ошибки отмены (нормальное поведение)
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return undefined;
      }

      // Устанавливаем сообщение об ошибке
      error.value = getErrorMessage(err, defaultErrorMessage);

      // Переброс ошибки чтобы компонент мог на неё реагировать
      throw err;
    } finally {
      loading.value = false;
      controller = null;
    }
  };

  /**
   * При размонтировании компонента отменяем все запросы
   * Это предотвращает утечки памяти и попытки обновления unmounted компонента
   */
  onBeforeUnmount(() => {
    if (controller) {
      controller.abort();
    }
  });

  return { loading, error, run };
}

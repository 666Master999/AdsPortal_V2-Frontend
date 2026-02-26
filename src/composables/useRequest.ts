/** Composable: оборачивает async-функцию в loading/error/data. */
import { ref, type Ref } from 'vue';
import { getErrorMessage } from '@/utils/authUtils';

export function useRequest<T>(fn: (...args: any[]) => Promise<T>, defaultMsg = 'Произошла ошибка') {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref('');
  const loading = ref(false);

  async function execute(...args: any[]) {
    loading.value = true;
    error.value = '';
    try { data.value = await fn(...args); return data.value; }
    catch (e: any) { error.value = getErrorMessage(e, defaultMsg); return null; }
    finally { loading.value = false; }
  }

  function reset() { data.value = null; error.value = ''; loading.value = false; }

  return { data, error, loading, execute, reset };
}

// src/composables/useAbortable.js
// tiny composable for performing an async request with abort support and shared
// loading/error state. helps eliminate repetitive controller boilerplate.

import { ref, onBeforeUnmount } from 'vue';
import { getErrorMessage } from '@/utils/authUtils';

export function useAbortable(defaultErrorMessage = '') {
  const loading = ref(false);
  const error = ref(null);
  let controller = null;

  async function run(action) {
    // action receives the AbortSignal and should return a promise (axios request)
    if (controller) {
      controller.abort(); // cancel previous
    }
    controller = new AbortController();
    loading.value = true;
    error.value = null;

    try {
      const result = await action(controller.signal);
      return result;
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // ignore cancellation
        return;
      }
      // set error, but rethrow so caller can react
      error.value = getErrorMessage(err, defaultErrorMessage);
      throw err;
    } finally {
      loading.value = false;
      controller = null;
    }
  }

  onBeforeUnmount(() => {
    if (controller) controller.abort();
  });

  return { loading, error, run };
}

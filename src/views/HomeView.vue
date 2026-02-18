<!-- src/views/HomeView.vue -->
<template>
  <div class="d-flex gap-4 align-items-center">
    <div class="d-flex align-items-center">
      <div
        class="status-circle me-1"
        :class="{'bg-success': isBackendConnected, 'bg-danger': !isBackendConnected}"
        :title="backendTooltip"
      ></div>
      <small>
        Бэк:
        <span v-if="!auth.initialized">проверка...</span>
        <span v-else>{{ isBackendConnected ? 'online' : 'offline' }}</span>
      </small>
    </div>

    <div class="d-flex align-items-center">
      <div
        class="status-circle me-1"
        :class="{'bg-success': isDbConnected, 'bg-danger': !isDbConnected}"
        :title="dbTooltip"
      ></div>
      <small>
        БД:
        <span v-if="!auth.initialized">проверка...</span>
        <span v-else>{{ isDbConnected ? 'online' : 'offline' }}</span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // убедитесь, что файл существует
import { apiClient } from '@/api/apiClient'; // опционально: использовать общий клиент

const auth = useAuthStore();

const isBackendConnected = ref(false);
const isDbConnected = ref(false);
const backendTooltip = ref('');
const dbTooltip = ref('');

let abortController = null;

async function fetchHealth() {
  // отменяем предыдущий запрос, если есть
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  try {
    // используем общий клиент; если хотите через стор — auth.client или auth.api
    const res = await apiClient.get('/api/health', { signal: abortController.signal });
    // пример ожидаемой структуры: { backend: true, db: true }
    isBackendConnected.value = !!res.data.backend;
    isDbConnected.value = !!res.data.db;
    backendTooltip.value = `status: ${isBackendConnected.value ? 'ok' : 'error'}`;
    dbTooltip.value = `status: ${isDbConnected.value ? 'ok' : 'error'}`;
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') {
      // запрос отменён — ничего не делаем
      return;
    }
    console.error('Health check failed', err);
    isBackendConnected.value = false;
    isDbConnected.value = false;
    backendTooltip.value = 'cannot reach backend';
    dbTooltip.value = 'cannot reach backend';
  } finally {
    abortController = null;
  }
}

onMounted(async () => {
  try {
    // если стор ещё не инициализирован — дождёмся init
    if (!auth.initialized) {
      if (typeof auth.init === 'function') {
        await auth.init();
      } else if (typeof auth.initAuth === 'function') {
        await auth.initAuth();
      }
    }
  } catch (err) {
    // не блокируем UI, но логируем
    console.warn('Auth init failed', err);
  } finally {
    // после инициализации или если она уже была — делаем health check
    fetchHealth();
  }
});

onBeforeUnmount(() => {
  if (abortController) abortController.abort();
});
</script>

<style scoped>
.status-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.bg-success {
  background-color: #198754 !important;
}
.bg-danger {
  background-color: #dc3545 !important;
}
</style>

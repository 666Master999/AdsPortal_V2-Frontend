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
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // убедитесь, что файл существует
import { apiClient } from '@/api/apiClient'; // опционально: использовать общий клиент
import { useAbortable } from '@/composables/useAbortable';

const auth = useAuthStore();

const isBackendConnected = ref(false);
const isDbConnected = ref(false);
const backendTooltip = ref('');
const dbTooltip = ref('');

const { run } = useAbortable('Health check failed');

async function fetchHealth() {
  try {
    const res = await run(signal => apiClient.get('/api/health', { signal }));
    if (res) {
      isBackendConnected.value = !!res.data.backend;
      isDbConnected.value = !!res.data.db;
      backendTooltip.value = `status: ${isBackendConnected.value ? 'ok' : 'error'}`;
      dbTooltip.value = `status: ${isDbConnected.value ? 'ok' : 'error'}`;
    }
  } catch (e) {
    // run already set error and logged via getErrorMessage
    isBackendConnected.value = false;
    isDbConnected.value = false;
    backendTooltip.value = 'cannot reach backend';
    dbTooltip.value = 'cannot reach backend';
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

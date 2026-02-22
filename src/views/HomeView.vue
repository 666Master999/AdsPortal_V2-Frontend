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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/apiClient';
import { useAbortable } from '@/composables/useAbortable';

const auth = useAuthStore();

const isBackendConnected = ref<boolean>(false);
const isDbConnected = ref<boolean>(false);
const backendTooltip = ref<string>('');
const dbTooltip = ref<string>('');

interface HealthResponse {
  backend: boolean;
  db: boolean;
}

const { run } = useAbortable('Health check failed');

async function fetchHealth(): Promise<void> {
  try {
    const res = await run((signal: AbortSignal) => apiClient.get<HealthResponse>('/api/health', { signal }));
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
      } else if (typeof (auth as any).initAuth === 'function') {
        await (auth as any).initAuth();
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

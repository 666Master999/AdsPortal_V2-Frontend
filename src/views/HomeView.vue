<!-- src/views/HomeView.vue -->
<template>
  <div class="home-view">
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

    <div class="mt-4">
      <AdsShowcase />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { useAbortable } from '@/composables/useAbortable';
import AdsShowcase from '@/pages/AdsShowcase.vue';

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
    const res = await run((signal: AbortSignal) => apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH, { signal }));
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
    if (!auth.initialized) {
      await auth.init();
    }
  } catch (err) {
    console.warn('Auth init failed', err);
  } finally {
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

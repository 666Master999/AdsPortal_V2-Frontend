<!-- frontend/src/views/HomeView.vue -->
<template>
  <div class="d-flex gap-4 align-items-center">
    <!-- Индикатор бэкенда -->
    <div class="d-flex align-items-center">
      <div
        class="status-circle me-1"
        :class="{'bg-success': isBackendConnected, 'bg-danger': !isBackendConnected}"
        :title="backendTooltip"
      ></div>
      <small>Бэк: {{ isBackendConnected ? 'online' : 'offline' }}</small>
    </div>

    <!-- Индикатор базы данных -->
    <div class="d-flex align-items-center">
      <div
        class="status-circle me-1"
        :class="{'bg-success': isDbConnected, 'bg-danger': !isDbConnected}"
        :title="dbTooltip"
      ></div>
      <small>БД: {{ isDbConnected ? 'online' : 'offline' }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const isBackendConnected = ref(false);
const isDbConnected = ref(false);
const backendTooltip = ref('');
const dbTooltip = ref('');

const auth = useAuthStore();

async function fetchHealth() {
  try {
    const res = await auth.api.get('/api/health');
    isBackendConnected.value = !!res.data.backend;
    isDbConnected.value = !!res.data.db;
    backendTooltip.value = `status: ${isBackendConnected.value ? 'ok' : 'error'}`;
    dbTooltip.value = `status: ${isDbConnected.value ? 'ok' : 'error'}`;
  } catch (err) {
    isBackendConnected.value = false;
    isDbConnected.value = false;
    backendTooltip.value = 'cannot reach backend';
    dbTooltip.value = 'cannot reach backend';
  }
}

onMounted(() => {
  // initialize auth store if not already
  if (!auth.initialized) {
    auth.init().finally(fetchHealth);
  } else {
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

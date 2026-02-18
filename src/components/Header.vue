<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" :to="{ name: 'home' }">AdsPortal V2</router-link>

      <div class="d-flex align-items-center">
        <template v-if="isAuthenticated">
          <div class="me-3 text-muted small">Привет, <strong>{{ username }}</strong></div>

          <button class="btn btn-outline-secondary me-2" :disabled="loading" @click="goToMyProfile">
            <span v-if="!loading">Кабинет</span>
            <span v-else>Загрузка...</span>
          </button>

          <button class="btn btn-danger" @click="onLogout">Выйти</button>
        </template>

        <template v-else>
          <router-link class="btn btn-outline-primary me-2" :to="{ name: 'login' }">Войти</router-link>
          <router-link class="btn btn-primary" :to="{ name: 'register' }">Регистрация</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const isAuthenticated = computed(() => !!auth.isAuthenticated);
const username = computed(() => auth.username ?? auth.login ?? '');

// Получаем publicId из стора, если есть
function getPublicId() {
  const raw = auth.publicId ?? auth.userId ?? auth.id ?? auth.user?.publicId;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? String(Math.trunc(n)) : null;
}

async function goToMyProfile() {
  const idFromStore = getPublicId();
  if (idFromStore) return router.push({ name: 'userProfile', params: { id: idFromStore } });

  loading.value = true;
  try {
    const res = await axios.get('/api/users/me', { withCredentials: true, timeout: 8000 });
    const id = res?.data?.publicId ?? res?.data?.public_id ?? res?.data?.id;
    const n = Number(id);
    if (Number.isFinite(n) && n > 0) {
      // опционально: обновить стор, если есть метод
      if (typeof auth.setPublicId === 'function') auth.setPublicId(String(Math.trunc(n)));
      return router.push({ name: 'userProfile', params: { id: String(Math.trunc(n)) } });
    }
  } catch (e) {
    console.warn('Не удалось получить publicId', e);
  } finally {
    loading.value = false;
  }
  // fallback: домой
  router.push({ name: 'home' });
}

async function onLogout() {
  if (typeof auth.logout === 'function') {
    try { await auth.logout(); } catch (e) { console.warn('Logout failed', e); }
  }
  router.replace({ name: 'home' });
}

onMounted(async () => {
  if (!auth.initialized && typeof auth.init === 'function') {
    try { await auth.init(); } catch (e) { console.warn('Auth init failed', e); }
  }
});
</script>

<style scoped>
.navbar { height: 64px; }
</style>

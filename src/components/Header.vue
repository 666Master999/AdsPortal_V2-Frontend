<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" :to="{ name: 'home' }">AdsPortal V2</router-link>

      <div class="d-flex align-items-center">
        <template v-if="isAuthenticated">
          <div class="me-3 text-muted small">Привет, <strong>{{ login }}</strong></div>

          <button class="btn btn-outline-secondary me-2" :disabled="loading" @click="goToMyProfile">
            <span v-if="!loading">Кабинет</span>
            <span v-else>Загрузка...</span>
          </button>

          <!-- вставить рядом с Кабинет/Выйти -->
          <router-link class="btn btn-success me-2" :to="{ name: 'createAd' }">Создать объявление</router-link>


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
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/utils/authUtils';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const isAuthenticated = computed(() => !!auth.isAuthenticated);
const login = computed(() => auth.userLogin);

// helper returns store getter value directly
function getPublicId() {
  return auth.userId;
}

async function goToMyProfile() {
  let id = auth.userId;
  if (!id) {
    loading.value = true;
    try {
      id = await auth.fetchUserId();
    } catch (e) {
      console.warn('fetchUserId failed', getErrorMessage(e));
    } finally {
      loading.value = false;
    }
  }

  if (id) {
    return router.push({ name: 'userProfile', params: { id } });
  }
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

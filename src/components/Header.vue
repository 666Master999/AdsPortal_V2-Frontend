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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/utils/authUtils';

const router = useRouter();
const auth = useAuthStore();

/** Состояние загрузки при переходе на профиль */
const loading = ref(false);

/** Проверка авторизации */
const isAuthenticated = computed(() => auth.isAuthenticated);

/** Логин текущего пользователя */
const login = computed(() => auth.userLogin);

/**
 * Переходит на профиль текущего пользователя
 * Если ID не известен, сначала запрашивает его с сервера
 */
const goToMyProfile = async (): Promise<void> => {
  let id: string | null = null;
  
  if (auth.userId) {
    id = auth.userId;
  } else {
    loading.value = true;
    try {
      const userId = await auth.fetchUserId();
      if (userId) {
        id = String(userId);
      }
    } catch (e) {
      console.warn('Ошибка при получении ID пользователя:', getErrorMessage(e));
    } finally {
      loading.value = false;
    }
  }

  if (id) {
    await router.push({ name: 'userProfile', params: { id } });
  } else {
    await router.push({ name: 'home' });
  }
};

/**
 * Выполняет логаут и перенаправляет на главную страницу
 */
const onLogout = async (): Promise<void> => {
  try {
    auth.logout();
  } catch (e) {
    console.warn('Ошибка при логауте:', getErrorMessage(e));
  }
  await router.replace({ name: 'home' });
};

/**
 * При загрузке компонента инициализирует состояние аутентификации
 */
onMounted(async () => {
  if (!auth.initialized) {
    try {
      await auth.init();
    } catch (e) {
      console.warn('Ошибка инициализации аутентификации:', getErrorMessage(e));
    }
  }
});
</script>

<style scoped>
.navbar { height: 64px; }
</style>

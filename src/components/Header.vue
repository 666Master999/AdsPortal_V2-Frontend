<!-- frontend/src/components/Header.vue -->
<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">AdsPortal V2</router-link>

      <div class="d-flex align-items-center">
        <template v-if="isAuthenticated">
          <div class="me-3 text-muted small">Привет, <strong>{{ login }}</strong></div>
          <router-link class="btn btn-outline-secondary me-2" :to="{ name: 'profile' }">Кабинет</router-link>
          <button class="btn btn-danger" @click="onLogout">Выйти</button>
        </template>

        <template v-else>
          <router-link class="btn btn-outline-primary me-2" to="/login">Войти</router-link>
          <router-link class="btn btn-primary" to="/register">Регистрация</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const isAuthenticated = computed(() => auth.isAuthenticated);
const login = computed(() => auth.login);

function onLogout() {
  auth.logout();
  router.push({ name: 'home' });
}
</script>

<style scoped>
.navbar { height: 64px; }
</style>

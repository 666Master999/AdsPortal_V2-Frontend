<!-- Root компонент приложения AdsPortal V2 -->

<template>
  <div id="app">
    <HeaderBar />
    <main class="container mt-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import HeaderBar from '@/components/Header.vue';
</script>

<style scoped>

#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Transition для смены страниц */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
html {
  scroll-behavior: smooth;
}

body {
  background-color: #f8f9fa;
}

/* Кастомные стили для bootstrap */
.btn {
  font-weight: 500;
  border-radius: 6px;
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.form-control,
.form-select {
  border-radius: 6px;
  border: 1px solid #ced4da;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>

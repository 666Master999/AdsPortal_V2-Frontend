<template>
  <div class="d-flex flex-column align-items-center justify-content-center" style="min-height:60vh;">
    <h1 class="display-4">Вас здесь быть не должно...</h1>
    <p class="text-muted">Похоже, такой страницы не существует.</p>
    <router-link class="btn btn-primary mt-3" :to="{ name: 'home' }">Вернуться на главную</router-link>
  </div>
</template>

<script setup lang="ts">
// Статическая страница 404
</script>

<style scoped>
.display-4 { font-size: 2.5rem; }
</style>

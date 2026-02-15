<!-- frontend/src/App.vue -->
<template>
  <div>
    <HeaderBar />
    <main class="container mt-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import HeaderBar from './components/Header.vue';
</script>

<style>
body { background-color: #f8f9fa; }
</style>

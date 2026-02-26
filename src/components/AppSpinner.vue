<template>
  <div :class="['text-center', wrapperClass]">
    <div class="spinner-border" :class="[`text-${color}`, size === 'sm' && 'spinner-border-sm']" role="status">
      <span class="visually-hidden">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string;
  size?: 'sm' | 'default';
  label?: string;
  wrapperClass?: string;
}>(), {
  color: 'primary',
  size: 'default',
  label: 'Загрузка…',
  wrapperClass: 'py-5'
});
</script>

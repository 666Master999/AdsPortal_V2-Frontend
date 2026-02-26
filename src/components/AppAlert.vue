<template>
  <div class="alert" :class="[`alert-${variant}`, dismissible && 'alert-dismissible fade show']" role="alert">
    <slot>{{ message }}</slot>
    <button v-if="dismissible" type="button" class="btn-close" aria-label="Закрыть" @click="emit('dismiss')" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: string;
  message?: string;
  dismissible?: boolean;
}>(), {
  variant: 'danger',
  message: '',
  dismissible: false
});
const emit = defineEmits<{ (e: 'dismiss'): void }>();
</script>

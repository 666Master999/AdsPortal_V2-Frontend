<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h4 class="card-title">Профиль пользователя</h4>
            <button class="btn btn-sm btn-danger" @click="onLogout" v-if="isOwnProfile">Выйти</button>
          </div>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else>
            <div class="mb-3">
              <label class="form-label text-muted">Логин</label>
              <div class="form-control-plaintext"><strong>{{ profile.login }}</strong></div>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Email</label>
              <div class="form-control-plaintext">{{ profile.email ?? '—' }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Телефон</label>
              <div class="form-control-plaintext">{{ profile.phone ?? '—' }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Зарегистрирован</label>
              <div class="form-control-plaintext">{{ formattedDate }}</div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-outline-secondary" @click="loadProfile" :disabled="loading">Обновить</button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/apiClient';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const auth = useAuthStore();

const profile = ref({});
const loading = ref(true);
const error = ref(null);

const formattedDate = computed(() => {
  if (!profile.value.createdAt) return '—';
  try { return new Date(profile.value.createdAt).toLocaleString(); }
  catch { return profile.value.createdAt; }
});

const isOwnProfile = computed(() => {
  // если в сторе есть username или id — сравниваем
  return auth.username && (auth.username === profile.value.login || auth.userId === props.id);
});

let abortController = null;

async function loadProfile() {
  loading.value = true;
  error.value = null;

  if (abortController) { try { abortController.abort(); } catch {} }
  abortController = new AbortController();

  try {
    const res = await apiClient.get(`/api/users/${props.id}`, { signal: abortController.signal });
    profile.value = res.data;
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    if (err?.response?.status === 404) {
      error.value = 'Пользователь не найден';
      return;
    }
    if (err?.response?.status === 401) {
      auth.logout();
      router.replace({ name: 'login' });
      return;
    }
    error.value = err?.response?.data?.message || 'Не удалось загрузить профиль';
  } finally {
    loading.value = false;
    abortController = null;
  }
}

function onLogout() {
  auth.logout();
  router.replace({ name: 'home' });
}

onMounted(async () => {
  try {
    if (!auth.initialized) {
      if (typeof auth.init === 'function') await auth.init();
      else if (typeof auth.initAuth === 'function') await auth.initAuth();
    }
    await loadProfile();
  } catch (err) {
    console.warn(err);
    await loadProfile();
  }
});

onBeforeUnmount(() => {
  if (abortController) try { abortController.abort(); } catch {}
});

// если id меняется (переход между профилями) — перезагрузим
watch(() => props.id, () => loadProfile());
</script>

<style scoped>
.form-control-plaintext { padding: .375rem .75rem; background: #f8f9fa; border-radius: .25rem; }
</style>

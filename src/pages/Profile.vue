<!-- frontend/src/pages/Profile.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h4 class="card-title">Профиль</h4>
            <button class="btn btn-sm btn-danger" @click="onLogout">Выйти</button>
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
          </div>

          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const profile = ref({
  id: null,
  login: '',
  email: null,
  phone: null,
  createdAt: null
});
const loading = ref(true);
const error = ref(null);

const formattedDate = computed(() => {
  if (!profile.value.createdAt) return '—';
  try {
    return new Date(profile.value.createdAt).toLocaleString();
  } catch {
    return profile.value.createdAt;
  }
});

async function loadProfile() {
  loading.value = true;
  error.value = null;
  try {
    const res = await auth.api.get('/api/users/me');
    profile.value = res.data;
  } catch (err) {
    error.value = 'Не удалось загрузить профиль';
    // if unauthorized, force logout and redirect to login
    if (err?.response?.status === 401) {
      auth.logout();
      router.push({ name: 'login' });
    }
  } finally {
    loading.value = false;
  }
}

function onLogout() {
  auth.logout();
  router.push({ name: 'home' });
}

onMounted(async () => {
  if (!auth.initialized) {
    await auth.init();
  }
  if (!auth.isAuthenticated) {
    router.push({ name: 'login' });
    return;
  }
  await loadProfile();
});
</script>

<style scoped>
.form-control-plaintext {
  padding: .375rem .75rem;
  background: #f8f9fa;
  border-radius: .25rem;
}
</style>

<!-- frontend/src/pages/Profile.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h4 class="card-title">Мой профиль</h4>
            <button class="btn btn-sm btn-danger" @click="onLogout">Выйти</button>
          </div>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else>
            <div class="mb-3">
              <label class="form-label text-muted">Аватар</label>
              <div>
                <img
                  v-if="profile.avatarUrl"
                  :src="profile.avatarUrl"
                  :alt="profile.login"
                  class="rounded-circle"
                  style="width: 100px; height: 100px; object-fit: cover;"
                />
                <div v-else class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                  <span class="text-muted">Нет аватара</span>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Логин</label>
              <div class="form-control-plaintext"><strong>{{ displayLogin }}</strong></div>
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

      <!-- Edit profile form and password change -->
      <ProfileEditor v-if="!loading" :profile="profile" @updated="onProfileUpdated" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatDate } from '@/utils/format';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { fetchMyProfile } from '@/api/profileService';
import { useAbortable } from '@/composables/useAbortable';
import ProfileEditor from '@/components/ProfileEditor.vue';

const auth = useAuthStore();
const router = useRouter();

const profile = ref({
  id: null,
  login: '',
  email: null,
  phone: null,
  avatarUrl: null,
  createdAt: null
});

const displayLogin = computed(() => profile.value.login || '');

const { loading, error, run } = useAbortable('Не удалось загрузить профиль');

const formattedDate = computed(() => formatDate(profile.value.createdAt));

async function loadProfile() {
  try {
    const res = await run(signal => fetchMyProfile({ signal }));
    if (res) profile.value = res.data;
  } catch (err) {
    // 401 errors handled globally by interceptor
    // error message already set by run
  }
}

function onProfileUpdated(updatedProfile) {
  // Update local profile with returned data
  Object.assign(profile.value, updatedProfile);
  error.value = '';
}

function onLogout() {
  auth.logout();
  router.replace({ name: 'home' });
}

onMounted(async () => {
  try {
    await auth.init();
    if (!auth.isAuthenticated) {
      router.replace({ name: 'login' });
      return;
    }
    await loadProfile();
  } catch (err) {
    console.warn('Auth init or profile load failed', err);
    await loadProfile();
  }
});

</script>

<style scoped>
.form-control-plaintext {
  padding: .375rem .75rem;
  background: #f8f9fa;
  border-radius: .25rem;
}
</style>

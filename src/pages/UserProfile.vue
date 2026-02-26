<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div v-if="error === 'Пользователь не найден'" class="card shadow-sm">
        <div class="card-body">
          <div class="text-center py-4">
            <div class="alert alert-warning mb-0">Пользователь не найден</div>
          </div>
        </div>
      </div>

      <div v-else class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h4 class="card-title">{{ isOwnProfile ? 'Мой профиль' : 'Профиль пользователя' }}</h4>
            <router-link v-if="isOwnProfile" class="btn btn-sm btn-primary" :to="{ name: 'profileEdit' }">
              Редактировать
            </router-link>
          </div>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else>
            <div class="mb-3">
              <label class="form-label text-muted">Аватар</label>
              <div>
                <img
                  v-if="avatarSrc"
                  :src="avatarSrc"
                  :alt="profile.login"
                  class="rounded-circle"
                  style="width: 100px; height: 100px; object-fit: cover;"
                />
                <div v-else class="bg-light rounded-circle d-flex align-items-center justify-content-center text-uppercase" style="width: 100px; height: 100px; font-size:36px; font-weight:600; color:#495057;">
                  <span v-if="initialLetter">{{ initialLetter }}</span>
                  <span v-else class="text-muted">—</span>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">Логин</label>
              <div class="form-control-plaintext d-flex align-items-center">
                <strong>{{ displayLogin }}</strong>
                <span v-if="profile.isBlocked" class="badge bg-danger ms-2">Заблокирован</span>
              </div>
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

              <!-- admin tools: block/unblock -->
              <button
                v-if="auth.isAdmin && !isOwnProfile"
                class="btn"
                :class="profile.isBlocked ? 'btn-success' : 'btn-danger'"
                @click="toggleBlock"
                :disabled="blockLoading"
              >
                {{ profile.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { formatDate } from '@/utils/format';
import { normalizeImageUrl } from '@/utils/adHelpers';
import { useAuthStore } from '@/stores/authStore';
import { fetchUserProfile } from '@/api/profileService';
import { blockUser, unblockUser } from '@/api/userService';
import { useAbortable } from '@/composables/useAbortable';
import type { UserProfile } from '@/types';

const props = defineProps<{ id: string }>()
const auth = useAuthStore();

const profile = ref<UserProfile>({
  id: 0,
  login: '',
  email: null,
  phone: null,
  avatarUrl: null,
  createdAt: null
});
const displayLogin = computed((): string => profile.value.login || '');

const avatarSrc = computed((): string | null => {
  const url = profile.value.avatarUrl || profile.value.avatar || null;
  if (!url) return null;
  return normalizeImageUrl(url);
});

const initialLetter = computed(() => {
  const name = profile.value.login || '';
  return name ? String(name).trim().charAt(0).toUpperCase() : '';
});
const { loading, error, run } = useAbortable('Не удалось загрузить профиль');
const blockLoading = ref(false);

const formattedDate = computed(() => formatDate(profile.value.createdAt));

const isOwnProfile = computed(() => {
  // делегируем проверку на стор
  return auth.isOwn(props.id);
});

async function loadProfile() {
  // we rely on API to supply isBlocked flag in user profile
  try {
    const res = await run((signal: AbortSignal) => fetchUserProfile(props.id, { signal }));
    if (res) profile.value = res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      error.value = 'Пользователь не найден';
      return;
    }
    // 401 will be handled globally; other errors already stored in error
  }
}

async function toggleBlock() {
  if (!profile.value.id) return;
  blockLoading.value = true;
  try {
    if (profile.value.isBlocked) {
      await unblockUser(profile.value.id);
    } else {
      await blockUser(profile.value.id);
    }
    await loadProfile();
  } catch (e) {
    console.error('Ошибка при изменении блокировки', e);
  } finally {
    blockLoading.value = false;
  }
}

onMounted(async () => {
  try {
    await auth.init();
    await loadProfile();
  } catch (err) {
    console.warn(err);
    await loadProfile();
  }
});

// если id меняется (переход между профилями) — перезагрузим
watch(() => props.id, () => loadProfile());
</script>

<style scoped>
.form-control-plaintext { padding: .375rem .75rem; background: #f8f9fa; border-radius: .25rem; }
</style>

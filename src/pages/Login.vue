<!-- frontend/src/pages/Login.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="card-title mb-3">Вход</h4>

          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <form @submit.prevent="submit" novalidate>
            <div class="mb-3">
              <label class="form-label">Логин</label>
              <input
                v-model.trim="login"
                type="text"
                class="form-control"
                :disabled="loading"
                required
                autocomplete="username"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input
                v-model="password"
                type="password"
                class="form-control"
                :disabled="loading"
                required
                autocomplete="current-password"
              />
            </div>

            <button class="btn btn-primary w-100" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-if="!loading">Войти</span>
              <span v-else>Выполняется...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as authApi from '@/api/authService';
import { useAuthStore } from '@/stores/authStore';

const login = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const router = useRouter();
const auth = useAuthStore();

function extractToken(response) {
  return response?.data?.token
    || response?.data?.accessToken
    || response?.data?.data?.token
    || null;
}

function extractPublicId(response) {
  // если сервер вернул publicId отдельно — используем его
  return response?.data?.publicId
    || response?.data?.public_id
    || response?.data?.data?.publicId
    || null;
}

const submit = async () => {
  error.value = '';
  if (!login.value || !password.value) {
    error.value = 'Введите логин и пароль.';
    return;
  }

  loading.value = true;
  try {
    const res = await authApi.loginUser({ login: login.value, password: password.value });
    const token = extractToken(res);

    if (!token) {
      throw new Error('Токен не получен от сервера.');
    }

    // сохраняем токен в сторе (и в localStorage внутри стора)
    auth.setToken(token);

    // если сервер вернул publicId в теле ответа — явно установим его в стор
    const serverPublicId = extractPublicId(res);
    if (serverPublicId && typeof auth.setPublicId === 'function') {
      auth.setPublicId(serverPublicId);
    }

    // перенаправляем на профиль залогиненного пользователя, если publicId известен
    const pid = auth.publicId ?? auth.userId ?? null;
    if (pid) {
      router.replace({ name: 'userProfile', params: { id: String(pid) } });
    } else {
      // fallback — на домашнюю страницу
      router.replace({ name: 'home' });
    }
  } catch (e) {
    const serverMessage = e?.response?.data?.message || e?.message || 'Ошибка входа';
    error.value = serverMessage;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.spinner-border { vertical-align: text-bottom; }
</style>

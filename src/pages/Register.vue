<!-- frontend/src/pages/Register.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="card-title mb-3">Регистрация</h4>

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
                autocomplete="new-password"
              />
            </div>

            <button class="btn btn-primary w-100" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-if="!loading">Зарегистрироваться</span>
              <span v-else>Регистрация...</span>
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

const submit = async () => {
  error.value = '';

  if (!login.value || !password.value) {
    error.value = 'Введите логин и пароль.';
    return;
  }

  loading.value = true;
  try {
    // В зависимости от имени экспорта в authService: registerUser или register
    const res = await authApi.registerUser({ login: login.value, password: password.value });
    const token = extractToken(res);

    if (!token) {
      throw new Error('Токен не получен от сервера.');
    }

    auth.setToken(token);
    router.replace({ name: 'home' });
  } catch (e) {
    const serverMessage = e?.response?.data?.message || e?.message || 'Ошибка регистрации';
    error.value = serverMessage;
    // console.error('Register error', e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.spinner-border { vertical-align: text-bottom; }
</style>

<!-- src/components/AuthForm.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="card-title mb-3">{{ title }}</h4>

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
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              />
            </div>

            <button class="btn btn-primary w-100" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-if="!loading">{{ submitLabel }}</span>
              <span v-else>{{ loadingLabel }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import * as authApi from '@/api/authService';
import { useAuthStore } from '@/stores/authStore';
import { extractToken, extractPublicId, getErrorMessage } from '@/utils/authUtils';

const props = defineProps({
  mode: { type: String, required: true, validator: v => ['login', 'register'].includes(v) }
});

const title = computed(() => (props.mode === 'login' ? 'Вход' : 'Регистрация'));
const submitLabel = computed(() => (props.mode === 'login' ? 'Войти' : 'Зарегистрироваться'));
const loadingLabel = computed(() => (props.mode === 'login' ? 'Выполняется...' : 'Регистрация...'));

const login = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const router = useRouter();
const auth = useAuthStore();

const submit = async () => {
  error.value = '';
  if (!login.value || !password.value) {
    error.value = 'Введите логин и пароль.';
    return;
  }

  loading.value = true;
  try {
    const res =
      props.mode === 'login'
        ? await authApi.loginUser({ login: login.value, password: password.value })
        : await authApi.registerUser({ login: login.value, password: password.value });

    const token = extractToken(res);
    if (!token) throw new Error('Токен не получен от сервера.');

    auth.setToken(token);

    // если сервер вернул publicId — на всякий случай
    const serverPublicId = extractPublicId(res);
    if (serverPublicId && typeof auth.setPublicId === 'function') {
      auth.setPublicId(serverPublicId);
    }

    // перенаправляем
    if (props.mode === 'login') {
      let pid = auth.userId;
      if (!pid) {
        pid = await auth.fetchUserId();
      }
      if (pid) {
        router.replace({ name: 'userProfile', params: { id: pid } });
        return;
      }
    }
    router.replace({ name: 'home' });
  } catch (e) {
    error.value = getErrorMessage(e, props.mode === 'login' ? 'Ошибка входа' : 'Ошибка регистрации');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.spinner-border { vertical-align: text-bottom; }
</style>

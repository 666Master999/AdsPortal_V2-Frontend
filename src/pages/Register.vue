<!-- frontend/src/pages/Register.vue -->
<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="card-title mb-3">Регистрация</h4>
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">Логин</label>
              <input v-model="login" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
            <button class="btn btn-primary w-100" type="submit">Зарегистрироваться</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../api/auth';
import { useAuthStore } from '../stores/auth';

const login = ref('');
const password = ref('');
const router = useRouter();
const auth = useAuthStore();

const submit = async () => {
  try {
    const res = await authApi.register({ login: login.value, password: password.value });
    const token = res.data.token;
    auth.setToken(token);
    router.push({ name: 'home' });
  } catch (e) {
    alert('Ошибка регистрации');
  }
};
</script>

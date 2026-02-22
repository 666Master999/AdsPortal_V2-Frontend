<!--
  Компонент формы аутентификации (вход/регистрация)
  
  Поддерживает оба режима:
  - login: форма входа с реал-тайм валидацией
  - register: форма регистрации с подтверждением пароля
  
  Функционал:
  - Реал-тайм валидация входов при блюре
  - Показывает валидационные ошибки для каждого поля
  - Показывает ошибки от сервера
  - Loading состояние во время запроса
-->
<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="card-title mb-3">{{ title }}</h4>

          <!-- Ошибка от сервера -->
          <div v-if="error" class="alert alert-danger" role="alert">
            <small>{{ error }}</small>
          </div>

          <!-- Валидационные ошибки -->
          <div v-if="Object.keys(validationErrors).length > 0" class="alert alert-warning">
            <small>
              <ul class="mb-0">
                <li v-for="(msg, field) in validationErrors" :key="field">
                  <strong>{{ field }}:</strong> {{ msg }}
                </li>
              </ul>
            </small>
          </div>

          <form @submit.prevent="submit" novalidate>
            <!-- Логин -->
            <div class="mb-3">
              <label for="login" class="form-label">Логин</label>
              <input
                id="login"
                v-model.trim="form.login"
                type="text"
                class="form-control"
                :disabled="loading"
                required
                autocomplete="username"
                placeholder="Минимум 3 символа"
                @blur="validateField('login')"
                :class="{ 'is-invalid': validationErrors.login }"
              />
              <small v-if="validationErrors.login" class="text-danger d-block mt-1">
                {{ validationErrors.login }}
              </small>
            </div>

            <!-- Пароль -->
            <div class="mb-3">
              <label for="password" class="form-label">Пароль</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                :disabled="loading"
                required
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                placeholder="3-50 символов"
                @blur="validateField('password')"
                :class="{ 'is-invalid': validationErrors.password }"
              />
              <small v-if="validationErrors.password" class="text-danger d-block mt-1">
                {{ validationErrors.password }}
              </small>
            </div>

            <!-- Подтверждение пароля (только для регистрации) -->
            <div v-if="mode === 'register'" class="mb-3">
              <label for="passwordConfirm" class="form-label">Подтверждение пароля</label>
              <input
                id="passwordConfirm"
                v-model="form.passwordConfirm"
                type="password"
                class="form-control"
                :disabled="loading"
                required
                autocomplete="new-password"
                @blur="validateField('passwordConfirm')"
                :class="{ 'is-invalid': validationErrors.passwordConfirm }"
              />
              <small v-if="validationErrors.passwordConfirm" class="text-danger d-block mt-1">
                {{ validationErrors.passwordConfirm }}
              </small>
            </div>

            <!-- Кнопка отправки -->
            <button
              class="btn btn-primary w-100"
              type="submit"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span>{{ loading ? loadingLabel : submitLabel }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as authApi from '@/api/authService';
import { useAuthStore } from '@/stores/authStore';
import { extractToken, getErrorMessage } from '@/utils/authUtils';
import { validateLogin, validatePassword } from '@/utils/validators';
import { useFormValidation } from '@/composables/useFormValidation';

/**
 * Props для компонента
 */
interface Props {
  /** Режим: 'login' или 'register' */
  mode: 'login' | 'register';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'login'
});

// ===== Computed properties =====

/**
 * Заголовок формы в зависимости от режима
 */
const title = computed(() => (props.mode === 'login' ? 'Вход' : 'Регистрация'));

/**
 * Текст кнопки отправки
 */
const submitLabel = computed(() => (props.mode === 'login' ? 'Войти' : 'Зарегистрироваться'));

/**
 * Текст во время загрузки
 */
const loadingLabel = computed(() => (props.mode === 'login' ? 'Выполняется...' : 'Регистрация...'));

// ===== State =====

/**
 * Данные формы
 */
const form = reactive({
  login: '',
  password: '',
  passwordConfirm: ''
});

/**
 * Состояние загрузки запроса
 */
const loading = ref(false);

/**
 * Сообщение об ошибке от сервера
 */
const error = ref('');

/**
 * Ошибки валидации для каждого поля
 */
const { errors: validationErrors, validateField: validateFieldWithForm, validateAll } =
  useFormValidation<typeof form>({
    login: (f) => validateLogin(f.login),
    password: (f) => validatePassword(f.password),
    passwordConfirm: (f) => {
      if (props.mode !== 'register') return { isValid: true };
      return f.password === f.passwordConfirm
        ? { isValid: true }
        : { isValid: false, error: 'Пароли не совпадают' };
    }
  });

// ===== Dependencies =====

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

// ===== Methods =====

/**
 * Валидирует отдельное поле формы
 * @param field - Название поля для валидации
 */
const validateField = (field: keyof typeof form): void => {
  validateFieldWithForm(form, field);
};

/**
 * Валидирует всю форму перед отправкой
 */
const validateForm = (): boolean => validateAll(form);

/**
 * Отправляет форму на сервер
 */
const submit = async (): Promise<void> => {
  error.value = '';

  // Валидируем форму перед отправкой
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    // Отправляем запрос на сервер
    const res =
      props.mode === 'login'
        ? await authApi.loginUser({ login: form.login, password: form.password })
        : await authApi.registerUser({ login: form.login, password: form.password });

    // Извлекаем токен из ответа
    const token = extractToken(res);
    if (!token) {
      throw new Error('Токен не получен от сервера');
    }

    // Сохраняем токен в store и localStorage
    auth.setToken(token);

    // Перенаправляем пользователя на сохранённый маршрут или на главную
    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : null;
    router.replace(redirectPath || { name: 'home' });
  } catch (err) {
    const action = props.mode === 'login' ? 'входа' : 'регистрации';
    error.value = getErrorMessage(err, `Ошибка ${action}`);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.spinner-border {
  vertical-align: text-bottom;
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath fill='%23dc3545' d='M8 4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1h3A.5.5 0 0 0 8 4Z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.text-danger {
  font-size: 0.875rem;
}
</style>

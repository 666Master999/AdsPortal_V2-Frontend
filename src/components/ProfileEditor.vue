<!-- src/components/ProfileEditor.vue -->
<template>
  <div class="card shadow-sm mt-4">
    <div class="card-header bg-light">
      <h5 class="mb-0">Редактирование профиля</h5>
    </div>
    <div class="card-body">
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          v-model.trim="formData.email"
          type="email"
          class="form-control"
          :disabled="loading"
          placeholder="your@email.com"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Телефон</label>
        <input
          v-model.trim="formData.phone"
          type="tel"
          class="form-control"
          :disabled="loading"
          placeholder="+7 999 999 99 99"
        />
      </div>

      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading"
          @click="submitProfile"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Сохранить
        </button>
        <button type="button" class="btn btn-secondary" :disabled="loading" @click="resetForm">
          Отмена
        </button>
      </div>
    </div>
  </div>

  <div class="card shadow-sm mt-4">
    <div class="card-header bg-light">
      <h5 class="mb-0">Аватар профиля</h5>
    </div>
    <div class="card-body">
      <div v-if="avatarError" class="alert alert-danger" role="alert">{{ avatarError }}</div>

      <div class="mb-3">
        <label class="form-label">Выбрать изображение</label>
        <input
          ref="fileInput"
          type="file"
          class="form-control"
          accept="image/*"
          :disabled="avatarLoading"
          @change="onFileSelected"
        />
        <small class="text-muted">Поддерживаемые форматы: JPG, PNG, GIF и т.д.</small>
      </div>

      <button
        type="button"
        class="btn btn-info"
        :disabled="!selectedFile || avatarLoading"
        @click="submitAvatar"
      >
        <span v-if="avatarLoading" class="spinner-border spinner-border-sm me-2"></span>
        Загрузить аватар
      </button>
    </div>
  </div>

  <div class="card shadow-sm mt-4">
    <div class="card-header bg-light">
      <h5 class="mb-0">Смена пароля</h5>
    </div>
    <div class="card-body">
      <div v-if="passwordError" class="alert alert-danger" role="alert">
        {{ passwordError }}
      </div>

      <div class="mb-3">
        <label class="form-label">Текущий пароль</label>
        <input
          v-model="passwordForm.current"
          type="password"
          class="form-control"
          :disabled="passwordLoading"
          autocomplete="current-password"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Новый пароль</label>
        <input
          v-model="passwordForm.newPassword"
          type="password"
          class="form-control"
          :disabled="passwordLoading"
          autocomplete="new-password"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Подтверждение нового пароля</label>
        <input
          v-model="passwordForm.confirm"
          type="password"
          class="form-control"
          :disabled="passwordLoading"
          autocomplete="new-password"
        />
      </div>

      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-warning"
          :disabled="passwordLoading"
          @click="submitPassword"
        >
          <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-2"></span>
          Сменить пароль
        </button>
        <button type="button" class="btn btn-secondary" :disabled="passwordLoading" @click="resetPassword">
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { updateProfile, changePassword, uploadAvatar } from '@/api/profileService';
import { getErrorMessage } from '@/utils/authUtils';
import type { UserProfile } from '@/types';

interface UpdateProfilePayload {
  email?: string;
  phone?: string;
}

interface FormData {
  email: string | null;
  phone: string | null;
}

interface PasswordForm {
  current: string;
  newPassword: string;
  confirm: string;
}

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  updated: [payload: Partial<UserProfile>]
}>()

const loading = ref<boolean>(false);
const error = ref<string>('');

const formData = reactive<FormData>({
  email: props.profile.email || '',
  phone: props.profile.phone || ''
});

const passwordLoading = ref<boolean>(false);
const passwordError = ref<string>('');

const passwordForm = reactive<PasswordForm>({
  current: '',
  newPassword: '',
  confirm: ''
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const avatarLoading = ref<boolean>(false);
const avatarError = ref<string>('');

async function submitProfile(): Promise<void> {
  error.value = '';
  const { email, phone } = formData;

  if (!email && !phone) {
    error.value = 'Заполните хотя бы одно поле.';
    return;
  }

  loading.value = true;
  try {
    const data: UpdateProfilePayload = {};
    if (email) data.email = email;
    if (phone) data.phone = phone;
    const res = await updateProfile(data);
    emit('updated', res.data);
  } catch (err) {
    error.value = getErrorMessage(err, 'Не удалось сохранить профиль');
  } finally {
    loading.value = false;
  }
}

function resetForm(): void {
  formData.email = props.profile.email || '';
  formData.phone = props.profile.phone || '';
  error.value = '';
}

async function submitPassword(): Promise<void> {
  passwordError.value = '';

  if (!passwordForm.current || !passwordForm.newPassword || !passwordForm.confirm) {
    passwordError.value = 'Заполните все поля.';
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirm) {
    passwordError.value = 'Новые пароли не совпадают.';
    return;
  }

  if (passwordForm.newPassword.length < 3) {
    passwordError.value = 'Новый пароль должен быть не менее 3 символов.';
    return;
  }

  passwordLoading.value = true;
  try {
    await changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.newPassword
    });
    passwordError.value = '';
    alert('Пароль успешно изменён!');
    resetPassword();
  } catch (err) {
    passwordError.value = getErrorMessage(err, 'Не удалось изменить пароль');
  } finally {
    passwordLoading.value = false;
  }
}

function resetPassword(): void {
  passwordForm.current = '';
  passwordForm.newPassword = '';
  passwordForm.confirm = '';
  passwordError.value = '';
}

function onFileSelected(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    selectedFile.value = null;
    return;
  }
  // Validate file type
  if (!file.type.startsWith('image/')) {
    avatarError.value = 'Выберите изображение.';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    return;
  }
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'Файл должен быть не более 5 МБ.';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    return;
  }
  selectedFile.value = file;
  avatarError.value = '';
}

async function submitAvatar(): Promise<void> {
  if (!selectedFile.value) {
    avatarError.value = 'Выберите файл.';
    return;
  }

  avatarLoading.value = true;
  try {
    const res = await uploadAvatar(selectedFile.value);
    // Update parent with new avatar URL
    emit('updated', { avatarUrl: res.data.avatarUrl });
    // Reset file input
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    avatarError.value = '';
  } catch (err) {
    avatarError.value = getErrorMessage(err, 'Не удалось загрузить аватар');
  } finally {
    avatarLoading.value = false;
  }
}
</script>

<style scoped>
.card-header {
  border-bottom: 1px solid #dee2e6;
}
</style>

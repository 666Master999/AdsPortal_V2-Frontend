<template>
  <div class="container py-4">
    <h3>Создать объявление</h3>
    <form @submit.prevent="onSubmit" enctype="multipart/form-data" novalidate>
      <div class="mb-3">
        <label class="form-label">Тип</label>
        <select v-model="form.Type" class="form-select" required>
          <option value="Sell">Sell</option>
          <option value="Buy">Buy</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Заголовок</label>
        <input v-model="form.Title" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Описание</label>
        <textarea v-model="form.Description" class="form-control" rows="4"></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Цена</label>
        <input v-model.number="form.Price" type="number" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Изображение (опционально)</label>
        <input ref="fileInput" @change="onFileChange" type="file" accept="image/*" class="form-control" />
        <img v-if="preview" :src="preview" class="img-thumbnail mt-2" style="max-width:200px" />
      </div>

      <div class="d-flex">
        <button class="btn btn-primary me-2" :disabled="submitting">
          <span v-if="!submitting">Создать</span>
          <span v-else>Отправка...</span>
        </button>
        <router-link class="btn btn-secondary" :to="{ name: 'home' }">Отмена</router-link>
      </div>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const auth = useAuthStore();

const form = ref({ Type: 'Sell', Title: '', Description: '', Price: null });
const file = ref(null);
const preview = ref(null);
const submitting = ref(false);
const error = ref('');
const fileInput = ref(null);

function onFileChange(e) {
  const f = e.target.files[0];
  if (!f) { file.value = null; preview.value = null; return; }
  file.value = f;
  preview.value = URL.createObjectURL(f);
}

async function onSubmit() {
  error.value = '';
  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append('Type', form.value.Type);
    fd.append('Title', form.value.Title);
    if (form.value.Description) fd.append('Description', form.value.Description);
    fd.append('Price', String(form.value.Price));
    if (file.value) fd.append('image', file.value);

    const token = auth.token || (typeof auth.getToken === 'function' ? await auth.getToken() : null);
    if (!token) throw new Error('Нет токена авторизации');

    const base = import.meta.env.VITE_API_BASE || '';
    const res = await fetch(base + '/api/ads', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    });

    if (res.status === 201) {
      const data = await res.json();
      router.push({ name: 'adDetails', params: { id: data.id } });
      return;
    }

    const txt = await res.text();
    throw new Error(txt || `Ошибка ${res.status}`);
  } catch (e) {
    error.value = e.message || 'Ошибка при создании объявления';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-4">Создать объявление</h3>

            <!-- Ошибки валидации -->
            <div v-if="Object.keys(validationErrors).length > 0" class="alert alert-warning mb-3">
              <strong>Ошибки валидации:</strong>
              <ul class="mb-0 mt-2">
                <li v-for="(msg, field) in validationErrors" :key="field">
                  <strong>{{ field }}:</strong> {{ msg }}
                </li>
              </ul>
            </div>

            <!-- Ошибка от сервера -->
            <div v-if="error" class="alert alert-danger mb-3">
              {{ error }}
            </div>

            <form @submit.prevent="onSubmit" novalidate>
              <!-- Тип объявления -->
              <div class="mb-3">
                <label for="type" class="form-label">Тип объявления <span class="text-danger">*</span></label>
                <select
                  id="type"
                  v-model="form.type"
                  class="form-select"
                  :disabled="submitting"
                >
                  <option value="">Выберите тип</option>
                  <option value="Sell">Продаю</option>
                  <option value="Buy">Ищу</option>
                </select>
              </div>

              <!-- Заголовок -->
              <div class="mb-3">
                <label for="title" class="form-label">Заголовок <span class="text-danger">*</span></label>
                <input
                  id="title"
                  v-model.trim="form.title"
                  type="text"
                  class="form-control"
                  placeholder="Например: iPhone 13, Диван, etc."
                  :disabled="submitting"
                  @blur="validateField('title')"
                  :class="{ 'is-invalid': validationErrors.title }"
                />
                <small v-if="validationErrors.title" class="text-danger">
                  {{ validationErrors.title }}
                </small>
              </div>

              <!-- Описание -->
              <div class="mb-3">
                <label for="description" class="form-label">Описание <span class="text-danger">*</span></label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-control"
                  rows="5"
                  placeholder="Подробное описание товара..."
                  :disabled="submitting"
                  @blur="validateField('description')"
                  :class="{ 'is-invalid': validationErrors.description }"
                ></textarea>
                <small v-if="validationErrors.description" class="text-danger">
                  {{ validationErrors.description }}
                </small>
                <small class="form-text text-muted">
                  {{ form.description?.length || 0 }}/3000 символов
                </small>
              </div>

              <!-- Цена -->
              <div class="mb-3">
                <label for="price" class="form-label">Цена (₽) <span class="text-danger">*</span></label>
                <input
                  id="price"
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  placeholder="0"
                  :disabled="submitting"
                  @blur="validateField('price')"
                  :class="{ 'is-invalid': validationErrors.price }"
                />
                <small v-if="validationErrors.price" class="text-danger">
                  {{ validationErrors.price }}
                </small>
              </div>

              <!-- Изображение -->
              <div class="mb-3">
                <label for="image" class="form-label">Изображение (опционально)</label>
                <input
                  id="image"
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="form-control"
                  @change="onFileChange"
                  :disabled="submitting"
                />
                <small class="form-text text-muted">
                  Форматы: JPG, PNG, WebP. Максимум 10 МБ
                </small>
                <img
                  v-if="preview"
                  :src="preview"
                  :alt="form.title"
                  class="img-thumbnail mt-2"
                  style="max-width: 200px; max-height: 200px;"
                />
              </div>

              <!-- Кнопки -->
              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="submitting || Object.keys(validationErrors).length > 0"
                >
                  <span v-if="!submitting">Создать объявление</span>
                  <span v-else>
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Отправка...
                  </span>
                </button>
                <router-link class="btn btn-secondary" :to="{ name: 'home' }">Отмена</router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { createAd } from '@/api/adsService';
import { getErrorMessage } from '@/utils/authUtils';
import {
  validateAdTitle,
  validateDescription,
  validatePrice
} from '@/utils/validators';

const router = useRouter();

/** Данные формы */
const form = reactive({
  type: '',
  title: '',
  description: '',
  price: null as number | null
});

/** Выбранный файл изображения */
const file = ref<File | null>(null);

/** Preview изображения */
const preview = ref('');

/** Состояние отправки */
const submitting = ref(false);

/** Сообщение об ошибке */
const error = ref('');

/** Ошибки валидации */
const validationErrors = reactive<Record<string, string>>({});

/**
 * Валидирует отдельное поле
 */
const validateField = (field: keyof typeof form): void => {
  switch (field) {
    case 'title': {
      const result = validateAdTitle(form.title);
      if (result.isValid) {
        delete validationErrors.title;
      } else {
        validationErrors.title = result.error || '';
      }
      break;
    }

    case 'description': {
      const result = validateDescription(form.description);
      if (result.isValid) {
        delete validationErrors.description;
      } else {
        validationErrors.description = result.error || '';
      }
      break;
    }

    case 'price': {
      const result = validatePrice(form.price ?? 0);
      if (result.isValid) {
        delete validationErrors.price;
      } else {
        validationErrors.price = result.error || '';
      }
      break;
    }
  }
};

/**
 * Обработчик выбора файла
 */
const onFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const selectedFile = target.files?.[0];

  if (!selectedFile) {
    file.value = null;
    preview.value = '';
    return;
  }

  // Проверка размера (10 МБ)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (selectedFile.size > MAX_SIZE) {
    validationErrors.image = 'Файл слишком большой (максимум 10 МБ)';
    file.value = null;
    preview.value = '';
    return;
  }

  // Проверка формата
  if (!selectedFile.type.startsWith('image/')) {
    validationErrors.image = 'Выберите изображение';
    file.value = null;
    preview.value = '';
    return;
  }

  file.value = selectedFile;
  preview.value = URL.createObjectURL(selectedFile);
  delete validationErrors.image;
};

/**
 * Отправляет форму на сервер
 */
const onSubmit = async (): Promise<void> => {
  error.value = '';

  // Валидируем все поля
  validateField('type');
  validateField('title');
  validateField('description');
  validateField('price');

  if (!form.type) {
    validationErrors.type = 'Выберите тип объявления';
  }

  // Если есть ошибки валидации — не отправляем
  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  submitting.value = true;

  try {
    await createAd({
      type: form.type as 'Sell' | 'Buy',
      title: form.title,
      description: form.description || undefined,
      price: form.price || 0,
      image: file.value || undefined
    });

    // Перенаправляем на главную с success уведомлением
    await router.replace({
      name: 'home',
      query: { success: 'ad_created' }
    });
  } catch (err) {
    error.value = getErrorMessage(err, 'Ошибка при создании объявления');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.text-danger {
  color: #dc3545;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}
</style>

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
                  v-model.number="form.type"
                  class="form-select"
                  :disabled="submitting"
                  @change="validateField('type')"
                >
                  <option :value="null">Выберите тип</option>
                  <option :value="0">Продам</option>
                  <option :value="1">Куплю</option>
                  <option :value="2">Услуги</option>
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
                  @input="validateField('title')"
                  :class="{ 'is-invalid': validationErrors.title }"
                />
                <small v-if="validationErrors.title" class="text-danger">
                  {{ validationErrors.title }}
                </small>
              </div>

              <!-- Описание -->
              <div class="mb-3">
                <label for="description" class="form-label">Описание</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-control"
                  rows="5"
                  placeholder="Подробное описание товара..."
                  :disabled="submitting"
                  @blur="validateField('description')"
                  @input="validateField('description')"
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
                <label for="price" class="form-label">Цена (₽)</label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    id="price"
                    v-model.number="form.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    placeholder="0"
                    :disabled="submitting || form.negotiable"
                    @blur="validateField('price')"
                    @input="validateField('price')"
                    :class="{ 'is-invalid': validationErrors.price }"
                    style="max-width: 200px;"
                  />
                  <div class="form-check ms-2">
                      <input class="form-check-input" type="checkbox" id="negotiable" v-model="form.negotiable" :disabled="submitting" @change="validateField('price')" />
                    <label class="form-check-label" for="negotiable">Договорная</label>
                  </div>
                </div>
                <small v-if="validationErrors.price" class="text-danger">
                  {{ validationErrors.price }}
                </small>
                <small class="form-text text-muted">0 отображается как «Бесплатно / Договорная».</small>
              </div>


              <!-- Изображения -->
              <div class="mb-3">
                <label class="form-label">Изображения (до 10 файлов, опционально)</label>
                <div class="border rounded p-3 bg-light position-relative mb-2"
                  @dragover.prevent="onDragOverZone"
                  @dragleave.prevent="onDragLeaveZone"
                  @drop.prevent="onDropZone"
                  :class="{ 'border-primary': isDragOver }">
                  <input
                    id="images"
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="onFilesChange"
                    multiple
                    :disabled="submitting"
                  />
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="triggerFileInput" :disabled="submitting">Загрузить изображения</button> 
                    <span class="text-muted">или перетащите сюда · Макс 10 файлов · JPG/PNG/WebP · 10 МБ/файл</span>
                    <button v-if="previews.length" type="button" class="btn btn-sm btn-outline-danger ms-auto" @click="clearFiles" :disabled="submitting">Очистить</button>
                  </div>
                  <div v-if="previews.length" class="row g-2 mt-2">
                    <div v-for="(p, idx) in previews" :key="p.id" class="col-auto">
                      <div
                        class="position-relative border rounded bg-white"
                        style="width:120px;height:90px;overflow:hidden;"
                        draggable="true"
                        @dragstart="handleDragStart($event, idx)"
                        @dragover.prevent
                        @drop.stop.prevent="handleDrop($event, idx)"
                      >
                        <img :src="p.url" alt="preview" class="w-100 h-100 object-fit-cover rounded" />
                        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" @click="removeFile(idx)">✕</button>
                        <button type="button" class="btn btn-sm btn-warning position-absolute bottom-0 end-0 m-1" @click="setMain(idx)" :aria-pressed="mainIndex===idx" :class="{ 'active': mainIndex===idx }" title="Сделать главным">★</button>
                        <span v-if="mainIndex===idx" class="badge bg-primary position-absolute top-0 start-0 m-1">Главное</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="validationErrors.image" class="text-danger mt-2">{{ validationErrors.image }}</div>
              </div>

              <!-- Кнопки -->
              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="submitting"
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
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import { createAd } from '@/api/adsService';
import { getErrorMessage } from '@/utils/authUtils';
import {
  validateAdTitle,
  validateDescription,
  validatePrice
} from '@/utils/validators';
import { useImageManager } from '@/composables/useImageManager';
import { useFormValidation } from '@/composables/useFormValidation';

const router = useRouter();

// form state with simple validation map
const form = reactive({
  type: null as number | null,
  title: '',
  description: '',
  price: null as number | null,
  negotiable: false
});

const validators = {
  type: (f: typeof form) => ({ isValid: f.type !== null, error: 'Тип обязателен' }),
  title: (f: typeof form) => validateAdTitle(f.title),
  description: (f: typeof form) => validateDescription(f.description),
  price: (f: typeof form) => validatePrice(f.price ?? undefined, !!f.negotiable),
  negotiable: () => ({ isValid: true })
};

const { errors: validationErrors, isValid, validateField: validateFieldWithForm } =
  useFormValidation<typeof form>(validators);
const error = ref('');
const submitting = ref(false);

// image manager handles files, previews, main index, reordering, etc.
const {
  files: imgFiles,
  previews,
  mainIndex,
  add: addFiles,
  clear: clearFiles,
  remove: removeFile,
  setMain,
  reorder
} = useImageManager();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

const formIsValid = computed(() => isValid.value && !!form.type);

function validateField(field: keyof typeof form) {
  validateFieldWithForm(form, field);
}

function normalizeFiles(fileList: FileList | null | undefined) {
  if (!fileList?.length) return [];
  return Array.from(fileList);
}

function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = normalizeFiles(input.files);
  if (files.length) addFiles(files);
  if (imgFiles.value.length === 0) delete validationErrors.image;
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleDragStart(e: DragEvent, idx: number) {
  try { e.dataTransfer?.setData('drag-idx', String(idx)); } catch {}
}

function handleDrop(e: DragEvent, dest: number) {
  e.preventDefault();
  const srcStr = e.dataTransfer?.getData('drag-idx');
  const src = srcStr !== undefined ? Number(srcStr) : null;
  if (src !== null && src !== dest) reorder(src, dest);
}

function onDragOverZone() { isDragOver.value = true; }
function onDragLeaveZone() { isDragOver.value = false; }
function onDropZone(e: DragEvent) {
  onDragLeaveZone();
  const dt = e.dataTransfer;
  if (!dt?.files?.length) return;
  addFiles(normalizeFiles(dt.files));
  if (imgFiles.value.length === 0) delete validationErrors.image;
}

async function onSubmit() {
  Object.keys(validators).forEach(k => validateField(k as keyof typeof form));
  if (!formIsValid.value) return;

  submitting.value = true;
  error.value = '';

  try {
    const payload: any = {
      type: Number(form.type),
      title: form.title,
      description: form.description || undefined,
      isNegotiable: !!form.negotiable
    };

    if (!form.negotiable) payload.price = form.price ?? 0;
    if (imgFiles.value.length) {
      // ensure main first
      const ordered = [...imgFiles.value];
      if (mainIndex.value > 0 && mainIndex.value < ordered.length) {
        ordered.unshift(ordered.splice(mainIndex.value, 1)[0]);
      }
      payload.images = ordered;
    }

    await createAd(payload);
    await router.replace({ name: 'home', query: { success: 'ad_created' } });
  } catch (e) {
    error.value = getErrorMessage(e, 'Ошибка при создании объявления');
  } finally {
    submitting.value = false;
  }
}
</script>

<!-- No custom styles: using Bootstrap only -->

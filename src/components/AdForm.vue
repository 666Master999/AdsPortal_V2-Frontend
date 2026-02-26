<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <!-- optional dates header -->
    <div v-if="createdAt" class="mb-2 text-muted">Создано: {{ formatDate(createdAt) }}</div>
    <div v-if="updatedAt" class="mb-2 text-muted">Обновлено: {{ formatDate(updatedAt) }}</div>

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
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <input
          id="price"
          v-model.number="form.price"
          type="number"
          min="0"
          step="0.01"
          class="form-control"
          placeholder="0"
          :disabled="submitting || form.negotiable || form.free"
          @blur="validateField('price')"
          @input="validateField('price')"
          :class="{ 'is-invalid': validationErrors.price }"
          style="max-width: 200px;"
        />
        <div class="form-check ms-2">
          <input class="form-check-input" type="checkbox" id="negotiable" v-model="form.negotiable" :disabled="submitting || form.free" @change="validateField('price')" />
          <label class="form-check-label" for="negotiable">Договорная</label>
        </div>
        <div class="form-check ms-2">
          <input class="form-check-input" type="checkbox" id="free" v-model="form.free" :disabled="submitting || form.negotiable" @change="validateField('price')" />
          <label class="form-check-label" for="free">Бесплатно</label>
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
        </div>
        <div v-if="images.length" class="row g-2 mt-2">
          <div v-for="(img, idx) in images" :key="img.tempId" class="col-auto">
            <div
              class="position-relative border rounded bg-white"
              style="width:120px;height:90px;overflow:hidden;"
              draggable="true"
              @dragstart="handleDragStart($event, idx)"
              @dragover.prevent
              @drop.stop.prevent="handleDrop($event, idx)"
            >
              <img :src="normalizeImageUrl(img.url)" alt="preview" class="w-100 h-100 object-fit-cover rounded" />
              <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" @click="removeImage(idx)">✕</button>
              <button type="button" class="btn btn-sm btn-warning position-absolute bottom-0 end-0 m-1" @click="setMain(idx)" :aria-pressed="mainIndex===idx" :class="{ 'active': mainIndex===idx }" title="Сделать главным">★</button>
              <span v-if="mainIndex===idx" class="badge bg-primary position-absolute top-0 start-0 m-1">Главное</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="validationErrors.image" class="text-danger mt-2">{{ validationErrors.image }}</div>
    </div>

    <!-- кнопки -->
    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        <slot name="submit-label">Сохранить</slot>
      </button>
      <slot name="cancel"></slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { formatDate } from '@/utils/format';
import { validateAdTitle, validateDescription, validatePrice } from '@/utils/validators';
import { useFormValidation } from '@/composables/useFormValidation';
import { useAdImages } from '@/composables/useAdImages';
import { normalizeImageUrl } from '@/utils/adHelpers';
import type { AdFormData, AdSubmitPayload } from '@/types';

const props = defineProps<{
  initial?: Partial<AdFormData>;
  initialImages?: Array<{ id?: number; url: string }>;
  initialMainIndex?: number;
  createdAt?: string;
  updatedAt?: string;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: AdSubmitPayload): void;
  (e: 'cancel'): void;
}>();

const form = reactive<AdFormData>({
  type: null, title: '', description: '', price: null, negotiable: false, free: false
});

const {
  images, removedImageIds, mainIndex,
  loadExisting, normalizeFiles, addNewFiles, removeImage, setMain, reorder
} = useAdImages(10);

// single watch with immediate covers mount + subsequent updates
watch(() => props.initial, (v) => {
  if (v) Object.assign(form, {
    type: v.type ?? null, title: v.title ?? '', description: v.description ?? '',
    price: v.price ?? null, negotiable: v.negotiable ?? false, free: v.free ?? false
  });
}, { immediate: true, deep: true });

watch(() => props.initialImages, (imgs) => {
  if (imgs) {
    loadExisting(imgs);
    if (props.initialMainIndex != null) mainIndex.value = props.initialMainIndex;
  }
}, { immediate: true });

const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

// validators
const validators = {
  type: (f: typeof form) => ({ isValid: f.type !== null, error: 'Тип обязателен' }),
  title: (f: typeof form) => validateAdTitle(f.title),
  description: (f: typeof form) => validateDescription(f.description),
  price: (f: typeof form) => validatePrice(f.price ?? undefined, !!f.negotiable || f.free),
  negotiable: () => ({ isValid: true }),
  free: () => ({ isValid: true })
};
const { errors: validationErrors, isValid, validateField: validateFieldWithForm } = useFormValidation<typeof form>(validators);

function validateField(field: keyof typeof form) {
  validateFieldWithForm(form, field);
}

watch(() => form.price, (val) => {
  if (val === 0) {
    form.free = true;
    form.negotiable = false;
  } else {
    if (form.free) form.free = false;
  }
});
watch(() => form.free, (val) => {
  if (val) {
    form.price = 0;
    form.negotiable = false;
  }
});
watch(() => form.negotiable, (val) => {
  if (val) {
    form.price = null;
    form.free = false;
  }
});

watch(images, () => {
  if (images.value.length <= 10) delete validationErrors.image;
});

function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = normalizeFiles(input.files);
  if (!files.length) return;

  const remaining = 10 - images.value.length;
  if (files.length > remaining) {
    validationErrors.image = `Максимум 10 изображений (осталось ${remaining})`;
    return;
  }

  addNewFiles(files);
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
  if (src !== null && src !== dest) {
    reorder(src, dest);
  }
}

function onDragOverZone() { isDragOver.value = true; }
function onDragLeaveZone() { isDragOver.value = false; }
function onDropZone() { onDragLeaveZone(); }

function handleSubmit() {
  // validate everything
  validateField('type');
  validateField('title');
  validateField('description');
  validateField('price');
  if (images.value.length > 10) {
    validationErrors.image = 'Максимум 10 изображений';
  }
  if (!isValid.value) return;
  emit('submit', {
    form: { ...form },
    images: images.value.slice(),
    removedImageIds: removedImageIds.value.slice(),
    mainIndex: mainIndex.value
  });
}
</script>

<style scoped>
.card-title { font-size: 1rem; }
</style>

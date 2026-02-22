<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="ad">
      <h1 class="mb-4">{{ ad.title }}</h1>
      <div class="mb-4">
        <div class="ratio ratio-16x9">
          <img v-if="images.length" :src="images[mainIndex]" class="rounded w-100 h-100 object-fit-contain" alt="" @click="openLightbox(mainIndex)" style="cursor:pointer;" />
          <div v-else class="bg-light rounded d-flex align-items-center justify-content-center">Нет изображения</div>
        </div>
        <div v-if="images.length > 1" class="row row-cols-auto g-2 mt-3 justify-content-center">
          <div v-for="(src, idx) in images" :key="idx" class="col">
            <img
              :src="src"
              class="img-thumbnail"
              style="width:60px; height:45px; object-fit:cover; cursor:pointer;"
              :class="{ 'border-primary': idx===mainIndex }"
              @click="selectThumbnail(idx)"
            />
          </div>
        </div>
      </div>

      <div class="border-top pt-3">
        <div class="mb-2"><strong class="text-primary">{{ displayPrice(ad) }}</strong></div>
        <div class="mb-3 text-muted">{{ adTypeLabel(ad) }}</div>
        <p v-if="ad.description">{{ ad.description }}</p>
        <p v-else class="text-muted">Описание отсутствует</p>

        <hr />

        <div>
          <small class="text-muted">Продавец: </small>
          <span v-if="ad.ownerId">
            <router-link :to="{ name: 'userProfile', params: { id: String(ad.ownerId) } }">
              {{ ad.ownerUserName || ad.ownerId }}
            </router-link>
          </span>
          <span v-else>{{ ad.ownerUserName || 'Пользователь' }}</span>
        </div>

        <div class="mt-3 text-muted">Опубликовано: {{ formatDate(ad.createdAt) }}</div>
      </div>

      <div class="mt-4">
        <router-link class="btn btn-outline-secondary" :to="{ name: 'adsShowcase' }">Вернуться в витрину</router-link>
      </div>

      <!-- lightbox modal -->
      <div v-if="lightboxOpen" class="modal-backdrop fade show"></div>
      <div class="modal fade" tabindex="-1" :class="{ show: lightboxOpen }" style="display: none;" ref="lightbox">
        <div class="modal-dialog modal-dialog-centered modal-xl" style="max-width:90vw;">
          <div class="modal-content bg-transparent border-0">
            <div class="modal-body p-0 position-relative">
              <img
              :src="images[lightboxIndex]"
              class="w-100 h-auto"
              style="cursor: zoom-in;"
              :style="lightboxZoom ? { transform: `scale(2) translate(${panX}px,${panY}px)` } : undefined"
              @mousedown.prevent="startPan"
            />
              <button type="button" class="btn-close btn-close-white bg-white rounded-circle position-absolute top-0 end-0 m-3 p-1" style="width:2rem; height:2rem;" aria-label="Close" @click="closeLightbox"></button>
              <button v-if="images.length>1" type="button" class="btn btn-light position-absolute top-50 start-0 translate-middle-y" @click="prevImage">‹</button>
              <button v-if="images.length>1" type="button" class="btn btn-light position-absolute top-50 end-0 translate-middle-y" @click="nextImage">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-secondary">Объявление не найдено.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchAd } from '@/api/adsService';
import type { Advertisement } from '@/types';
import { API_BASE_URL } from '@/config/apiConfig';
import { formatDate, formatPrice } from '@/utils/format';

const route = useRoute();
const id = String(route.params.id || '');

const loading = ref(true);
const error = ref('');
const ad = ref<Advertisement | null>(null);
const images = ref<string[]>([]);
const mainIndex = ref(0);

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const lightbox = ref<HTMLElement | null>(null);
const lightboxZoom = ref(false);

// panning when zoomed
const panX = ref(0);
const panY = ref(0);
let isPanning = false;
let lastMouseX = 0;
let lastMouseY = 0;

function normalizedImage(url?: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return url.startsWith('/') ? base + url : base + '/' + url;
}

function resolveTypeField(a: Advertisement | null) {
  if (!a) return undefined;
  const t = (a as any).type ?? (a as any).category ?? null;
  if (t === null || t === undefined) return undefined;
  if (typeof t === 'number') return t;
  if (t === 'Sell' || t === 'Buy') return t;
  const n = Number(t);
  return Number.isNaN(n) ? t : n;
}

function adTypeLabel(a: Advertisement | null) {
  const t = resolveTypeField(a);
  if (t === 'Sell' || Number(t) === 0) return 'Продам';
  if (t === 'Buy' || Number(t) === 1) return 'Куплю';
  if (Number(t) === 2) return 'Услуги';
  return '—';
}

const selectThumbnail = (idx: number) => {
  mainIndex.value = idx;
};

const openLightbox = (idx: number) => {
  lightboxIndex.value = idx;
  lightboxOpen.value = true;
  lightboxZoom.value = false;
  document.body.style.overflow = 'hidden';
  const el = lightbox.value as any;
  if (el) { el.style.display = 'block'; el.classList.add('show'); }
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  lightboxZoom.value = false;
  document.body.style.overflow = '';
  const el = lightbox.value as any;
  if (el) { el.style.display = 'none'; el.classList.remove('show'); }
};

const prevImage = () => {
  if (images.value.length <= 1) return;
  lightboxIndex.value = (lightboxIndex.value + images.value.length - 1) % images.value.length;
  lightboxZoom.value = false;
};

const nextImage = () => {
  if (images.value.length <= 1) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % images.value.length;
  lightboxZoom.value = false;
};



const onKeyDown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
};

const startPan = (e: MouseEvent) => {
  // if not zoomed yet, enter zoom mode first
  if (!lightboxZoom.value) {
    lightboxZoom.value = true;
    // reset pan offsets
    panX.value = 0;
    panY.value = 0;
  }
  if (!lightboxZoom.value) return;
  isPanning = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
};

const doPan = (e: MouseEvent) => {
  if (!isPanning) return;
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  panX.value += dx;
  panY.value += dy;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
};

const endPan = () => {
  isPanning = false;
  // release exits zoom
  lightboxZoom.value = false;
  panX.value = 0;
  panY.value = 0;
};


onMounted(async () => {
  // add pan listeners once attached
  document.addEventListener('mousemove', doPan);
  document.addEventListener('mouseup', endPan);
  // keyboard nav
  document.addEventListener('keydown', onKeyDown);

  try {
    const res = await fetchAd(id);
    ad.value = res.data;
    images.value = (ad.value?.imageUrls || []).map(u => normalizedImage(u));
    mainIndex.value = 0;
    // reset lightbox as well
    lightboxIndex.value = 0;
    lightboxOpen.value = false;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      error.value = 'Объявление не найдено';
      return;
    }
    error.value = err?.message || 'Ошибка при загрузке объявления';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('mousemove', doPan);
  document.removeEventListener('mouseup', endPan);
  document.removeEventListener('keydown', onKeyDown);
});

function displayPrice(a: Advertisement | null) {
  if (!a) return '—';
  if (a.isNegotiable === true) return 'Договорная';
  if (a.price === 0) return 'Бесплатно';
  return formatPrice(a.price ?? undefined);
}

</script>

<style scoped>
.zoomed { transform: scale(2); cursor: zoom-out; }
</style>

<style scoped>
.img-fluid { max-height: 480px; object-fit: cover; width: 100%; }
</style>

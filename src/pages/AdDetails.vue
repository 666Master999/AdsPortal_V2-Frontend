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

      <div class="mt-4 d-flex flex-wrap gap-2">
        <router-link class="btn btn-outline-secondary" :to="{ name: 'adsShowcase' }">Вернуться в витрину</router-link>

        <template v-if="canManage">
          <router-link
            class="btn btn-primary"
            :to="{ name: 'editAd', params: { id: String(ad.id) } }"
          >Редактировать</router-link>

          <button class="btn btn-warning" @click="toggleVisibility" :disabled="actionLoading">
            {{ adVisible ? 'Скрыть' : 'Показать' }}
          </button>

          <button class="btn btn-danger" @click="confirmDelete" :disabled="actionLoading">
            Удалить
          </button>
        </template>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchAd, deleteAd, setAdVisibility } from '@/api/adsService';
import { useAbortable } from '@/composables/useAbortable';
import type { Advertisement } from '@/types';
import { normalizeImageUrl, adTypeLabel, displayPrice } from '@/utils/adHelpers';

import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/format';

const route = useRoute();
const id = String(route.params.id || '');

const { loading, error, run } = useAbortable('Ошибка при загрузке объявления');
const ad = ref<Advertisement | null>(null);
const actionLoading = ref(false);

const auth = useAuthStore();
const images = ref<string[]>([]);
const mainIndex = ref(0);

const lightboxOpen = ref(false);

// computed helpers for management
const canManage = computed(() => {
  if (!auth.isAuthenticated) return false;
  if (auth.isAdmin) return true;
  if (auth.userIsBlocked) return false;
  return auth.isOwn(ad.value?.ownerId);
});

const adVisible = computed(() => {
  // infer visibility from status or explicit flag
  if (!ad.value) return false;
  // assume status !== 'archived' means visible
  if (typeof ad.value.isVisible === 'boolean') {
    return ad.value.isVisible;
  }
  return ad.value.status !== 'hidden' && ad.value.status !== 'archived';
});
const lightboxIndex = ref(0);
const lightbox = ref<HTMLElement | null>(null);
const lightboxZoom = ref(false);

// panning when zoomed
const panX = ref(0);
const panY = ref(0);
let isPanning = false;
let lastMouseX = 0;
let lastMouseY = 0;

const selectThumbnail = (idx: number) => {
  // no change
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


// action helpers

async function toggleVisibility() {
  if (!ad.value) return;
  actionLoading.value = true;
  try {
    await setAdVisibility(ad.value.id, !adVisible.value);
    // update local state
    if (ad.value) {
      if (typeof ad.value.isVisible === 'boolean') {
        ad.value.isVisible = !ad.value.isVisible;
      } else {
        ad.value.status = adVisible.value ? 'hidden' : 'active';
      }
    }
  } catch (e) {
    console.error('Ошибка изменения видимости', e);
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete() {
  if (!ad.value) return;
  if (!confirm('Удалить объявление? Это действие можно будет отменить только админом.')) return;
  actionLoading.value = true;
  deleteAd(ad.value.id)
    .then(() => {
      // после удаления перенаправляем на витрину
      window.alert('Объявление помечено как удалённое');
      window.location.assign('/ads');
    })
    .catch((e) => {
      console.error('Ошибка при удалении', e);
    })
    .finally(() => { actionLoading.value = false; });
}

onMounted(async () => {
  // add pan listeners once attached
  document.addEventListener('mousemove', doPan);
  document.addEventListener('mouseup', endPan);
  // keyboard nav
  document.addEventListener('keydown', onKeyDown);

  try {
    const res = await run(() => fetchAd(id));
    if (res) {
      ad.value = res.data;
      
      // Попробовать использовать новый список images, если есть
      if (ad.value?.images && ad.value.images.length > 0) {
        // Сортируем по 'order', на случай если бэкенд не отсортировал
        const sorted = [...ad.value.images].sort((a, b) => a.order - b.order);
        const cb = ad.value.updatedAt ? `v=${encodeURIComponent(ad.value.updatedAt)}` : `v=${Date.now()}`;
        images.value = sorted.map(i => {
          const raw = i.url || '';
          const norm = normalizeImageUrl(raw);
          if (raw.startsWith('blob:')) return norm;
          return norm + (raw.includes('?') ? '&' : '?') + cb;
        });

        // Устанавливаем основной индекс на изображение с isMain
        const midx = sorted.findIndex(i => i.isMain);
        mainIndex.value = midx >= 0 ? midx : 0;
      } else {
        // Фолбэк на старые imageUrls
        const cb = ad.value?.updatedAt ? `v=${encodeURIComponent(ad.value.updatedAt)}` : `v=${Date.now()}`;
        images.value = (ad.value?.imageUrls || []).map(u => {
          const raw = u || '';
          const norm = normalizeImageUrl(raw);
          if (raw.startsWith('blob:')) return norm;
          return norm + (raw.includes('?') ? '&' : '?') + cb;
        });
        mainIndex.value = 0;
      }
      
      lightboxIndex.value = 0;
      lightboxOpen.value = false;
    }
  } catch (err: any) {
    if (err?.response?.status === 404) {
      error.value = 'Объявление не найдено';
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('mousemove', doPan);
  document.removeEventListener('mouseup', endPan);
  document.removeEventListener('keydown', onKeyDown);
});


</script>

<style scoped>
.img-fluid { max-height: 480px; object-fit: cover; width: 100%; }
</style>

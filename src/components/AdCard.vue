<template>
  <router-link :to="{ name: 'adDetails', params: { id: String(ad.id) } }" class="text-decoration-none text-reset">
    <div class="card h-100 position-relative">
        <img v-if="mainImageUrl" :src="mainImageUrl" class="card-img-top" alt="" style="height:160px; object-fit:cover;" />
      <div v-else class="bg-light d-flex align-items-center justify-content-center" style="height:160px;">No image</div>
      <!-- admin/owner quick actions -->
      <div v-if="canManage" class="position-absolute top-0 end-0 m-2">
        <router-link :to="{ name: 'editAd', params: { id: String(ad.id) } }" class="btn btn-sm btn-outline-light me-1" title="Редактировать">✎</router-link>
      </div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title mb-0">{{ ad.title }}</h5>
          <span class="badge bg-secondary">{{ adTypeLabel(ad) }}</span>
        </div>
        <p class="card-text text-truncate">{{ ad.description }}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <strong class="text-primary">{{ displayPrice(ad) }}</strong>
          <small class="text-muted">{{ formatDate(ad.createdAt) }}</small>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { Advertisement } from '@/types';
import { formatDate } from '@/utils/format';
import { normalizeImageUrl, adTypeLabel, displayPrice } from '@/utils/adHelpers';
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const props = defineProps<{ ad: Advertisement }>();
const auth = useAuthStore();

const canManage = computed(() => {
  if (!auth.isAuthenticated) return false;
  if (auth.isAdmin) return true;
  if (auth.userIsBlocked) return false;
  return auth.isOwn(props.ad.ownerId);
});

const mainImageUrl = computed(() => {
  if (props.ad.images && props.ad.images.length > 0) {
    // Находим основное, либо берем первое по списку
    const mainImg = props.ad.images.find(img => img.isMain) || props.ad.images[0];
    // cache-bust using ad.updatedAt when available, skip for blob URLs
    const cb = props.ad.updatedAt ? `v=${encodeURIComponent(props.ad.updatedAt)}` : `v=${Date.now()}`;
    const raw = mainImg.url || '';
    const norm = normalizeImageUrl(raw);
    if (raw.startsWith('blob:')) return norm;
    return norm + (raw.includes('?') ? '&' : '?') + cb;
  }
  // Фолбэк на старые imageUrls
  if (props.ad.imageUrls && props.ad.imageUrls.length > 0) {
    const raw = props.ad.imageUrls[0] || '';
    const norm = normalizeImageUrl(raw);
    const cb = props.ad.updatedAt ? `v=${encodeURIComponent(props.ad.updatedAt)}` : `v=${Date.now()}`;
    if (raw.startsWith('blob:')) return norm;
    return norm + (raw.includes('?') ? '&' : '?') + cb;
  }
  return null;
});
</script>

<style scoped>
.card-title { font-size: 1rem; }
</style>

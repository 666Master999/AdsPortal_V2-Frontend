<template>
  <router-link :to="{ name: 'adDetails', params: { id: String(ad.id) } }" class="text-decoration-none text-reset">
    <div class="card h-100">
        <img v-if="ad.imageUrls?.[0]" :src="normalizedImage(ad.imageUrls?.[0])" class="card-img-top" alt="" style="height:160px; object-fit:cover;" />
      <div v-else class="bg-light d-flex align-items-center justify-content-center" style="height:160px;">No image</div>
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
import { API_BASE_URL } from '@/config/apiConfig';
import { formatDate, formatPrice } from '@/utils/format';

const props = defineProps<{ ad: Advertisement }>();

function normalizedImage(url?: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return url.startsWith('/') ? base + url : base + '/' + url;
}

function resolveTypeField(ad: Advertisement) {
  const t = (ad as any).type ?? (ad as any).category ?? (ad as any).status ?? null;
  if (t === null || t === undefined) return undefined;
  if (typeof t === 'number') return t;
  if (t === 'Sell' || t === 'Buy') return t;
  const n = Number(t);
  return Number.isNaN(n) ? t : n;
}

function adTypeLabel(ad: Advertisement) {
  const t = resolveTypeField(ad);
  if (t === 'Sell' || Number(t) === 0) return 'Продам';
  if (t === 'Buy' || Number(t) === 1) return 'Куплю';
  if (Number(t) === 2) return 'Услуги';
  return '—';
}

function displayPrice(ad: Advertisement) {
  if (ad.isNegotiable === true) return 'Договорная';
  if (ad.price === 0) return 'Бесплатно';
  return formatPrice(ad.price ?? undefined);
}

</script>

<style scoped>
.card-title { font-size: 1rem; }
</style>

<template>
  <div class="container py-4">
    <h2 class="mb-3">Витрина объявлений</h2>

    <div class="mb-4 d-flex align-items-center justify-content-between">
      <ul class="nav nav-tabs mb-0">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'All' }" @click="tab = 'All'">Все</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'Sell' }" @click="tab = 'Sell'">Продам</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'Buy' }" @click="tab = 'Buy'">Куплю</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'Service' }" @click="tab = 'Service'">Услуги</button>
        </li>
      </ul>

      <div class="d-flex gap-2 align-items-center">
        <div class="input-group input-group-sm">
          <button class="btn btn-outline-secondary" :disabled="page <= 1" @click="prevPage">‹</button>
          <span class="input-group-text">Стр. {{ page }}</span>
          <button class="btn btn-outline-secondary" :disabled="!hasMore" @click="nextPage">›</button>
        </div>

        <select class="form-select form-select-sm" style="width: auto;" v-model.number="limit" @change="onLimitChange">
          <option v-for="s in pageSizes" :key="s" :value="s">{{ s }} /стр</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <div v-if="ads.length === 0" class="alert alert-secondary">Объявлений пока нет.</div>

      <div class="row g-3">
        <div
          class="col-md-4"
          v-for="ad in filteredAds"
          :key="ad.id"
        >
          <AdCard :ad="ad" />
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import AdCard from '@/components/AdCard.vue';
import { fetchAds } from '@/api/adsService';
import { useAbortable } from '@/composables/useAbortable';
import type { Advertisement } from '@/types';

const auth = useAuthStore();
const tab = ref<'All' | 'Sell' | 'Buy' | 'Service'>('All');
const ads = ref<Advertisement[]>([]);

const filteredAds = computed(() => {
  let list = ads.value;

  // remove hidden/невидимые объявления для обычных пользователей
  if (!auth.isAdmin) {
    list = list.filter(ad => {
      // Изначально полагаемся на то, что бэкенд отфильтровал,
      // но для верности проверяем доступные флаги
      if (ad.isDeleted) return false;
      if (ad.isHidden) return false;
      if (typeof ad.isVisible === 'boolean' && !ad.isVisible) return false;
      return ad.status !== 'hidden' && ad.status !== 'archived';
    });
  }

  if (tab.value === 'All') return list;
  const typeNum = tab.value === 'Sell' ? 0 : tab.value === 'Buy' ? 1 : tab.value === 'Service' ? 2 : null;
  return list.filter(ad => ad.type === typeNum);
});
const page = ref<number>(1);
const limit = ref<number>(50);
const pageSizes = [10, 20, 50];
const hasMore = ref<boolean>(false);
const { loading, run } = useAbortable('Не удалось загрузить объявления');

async function load() {
  if (!auth.initialized) {
    try { await auth.init(); } catch {}
  }
  try {
    const opts: any = { page: page.value, limit: limit.value };
    if (tab.value === 'Sell') opts.type = 0;
    else if (tab.value === 'Buy') opts.type = 1;
    else if (tab.value === 'Service') opts.type = 2;
    // 'All' does not filter
    const res = await run(() => fetchAds(opts));
    if (res) {
      ads.value = res.data || [];
      hasMore.value = (res.data?.length ?? 0) >= limit.value;
    }
  } catch (err) {
    ads.value = [];
    hasMore.value = false;
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value -= 1;
    load();
  }
}

function nextPage() {
  if (hasMore.value) {
    page.value += 1;
    load();
  }
}

function onLimitChange() {
  page.value = 1;
  load();
}

watch(() => tab.value, () => { page.value = 1; load(); }, { immediate: true });
</script>

<style scoped>
.container { max-width: 1100px; }
.card { height: 100%; }
</style>

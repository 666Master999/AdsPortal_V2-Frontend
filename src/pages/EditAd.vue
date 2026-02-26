<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-4">Редактировать объявление</h3>

            <div v-if="adLoading" class="text-center py-5">
              <AppSpinner />
            </div>

            <!-- Ошибка от сервера -->
            <AppAlert v-if="error" variant="danger" class="mb-3">
              {{ error }}
            </AppAlert>

            <!-- Успех -->
            <AppAlert v-if="successMessage" variant="success" class="mb-3">
              {{ successMessage }}
            </AppAlert>

            <AdForm
              v-if="!adLoading"
              :submitting="submitting"
              :initial="form"
              :initialImages="initialImages"
              :initialMainIndex="initialMainIndex"
              :createdAt="createdAt"
              :updatedAt="updatedAt"
              @submit="onSubmit"
            >
              <template #cancel>
                <router-link class="btn btn-secondary" :to="{ name: 'adDetails', params: { id } }">Отмена</router-link>
              </template>
              <template #submit-label>Сохранить</template>
            </AdForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchAd, updateAd } from '@/api/adsService';
import { getErrorMessage } from '@/utils/authUtils';
import { buildAdFormData } from '@/utils/buildAdFormData';
import { useAuthGuard } from '@/composables/useAuthGuard';
import AdForm from '@/components/AdForm.vue';
import AppSpinner from '@/components/AppSpinner.vue';
import AppAlert from '@/components/AppAlert.vue';
import { normalizeImageUrl } from '@/utils/adHelpers';
import type { AdFormData, AdSubmitPayload } from '@/types';

const route = useRoute();
const id = String(route.params.id || '');
const { guard } = useAuthGuard({ blockedMessage: 'Вы заблокированы и не можете редактировать объявления' });

const form = ref<AdFormData>({ type: null, title: '', description: '', price: null, negotiable: false, free: false });
const initialImages = ref<Array<{ id?: number; url: string }>>([]);
const initialMainIndex = ref(0);
const createdAt = ref('');
const updatedAt = ref('');
const error = ref('');
const successMessage = ref('');
const submitting = ref(false);
const adLoading = ref(false);

async function loadAd() {
  adLoading.value = true;
  try {
    const { data } = await fetchAd(id);
    form.value = {
      type: data.type ?? null, title: data.title,
      description: data.description || '', price: data.price ?? null,
      negotiable: !!data.isNegotiable, free: data.price === 0
    };
    createdAt.value = data.createdAt;
    updatedAt.value = data.updatedAt || '';

    // Используем новый список объектов images (с id, url, isMain, order)
    if (Array.isArray(data.images) && data.images.length > 0) {
      // Append a cache-busting query param based on ad updatedAt to avoid
      // browser showing stale image after server-side replace/delete
      const cb = data.updatedAt ? `v=${encodeURIComponent(data.updatedAt)}` : `v=${Date.now()}`;
      initialImages.value = data.images.map((img) => ({
        id: img.id,
        url: normalizeImageUrl(img.url) + (img.url.includes('?') ? '&' : '?') + cb
      }));

      // Если в объекте есть isMain, используем его, иначе ищем через mainImageId
      const mainIdx = data.images.findIndex((img) => img.isMain);
      if (mainIdx >= 0) {
        initialMainIndex.value = mainIdx;
      } else if (data.mainImageId != null) {
        const idx = initialImages.value.findIndex(img => img.id === data.mainImageId);
        initialMainIndex.value = idx >= 0 ? idx : 0;
      } else {
        initialMainIndex.value = 0;
      }
    } else {
      // Фолбэк на старый imageUrls, если images почему-то пуст
      initialImages.value = (data.imageUrls || []).map((u: string, idx: number) => ({ 
        id: idx, 
        url: normalizeImageUrl(u) 
      }));
      initialMainIndex.value = 0;
    }
  } catch {
    error.value = 'Не удалось загрузить объявление';
  } finally {
    adLoading.value = false;
  }
}

async function onSubmit(payload: AdSubmitPayload) {
  error.value = '';
  submitting.value = true;
  try {
    await updateAd(id, buildAdFormData({ ...payload, isCreate: false }));
    await loadAd();
    successMessage.value = 'Объявление обновлено';
  } catch (e: any) {
    error.value = getErrorMessage(e, 'Ошибка при обновлении объявления');
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  const { ok, error: guardError } = await guard();
  if (!ok) { if (guardError) error.value = guardError; return; }
  await loadAd();
});
</script>

<style scoped>
.card-title { font-size: 1rem; }
</style>

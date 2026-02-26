<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-4">Создать объявление</h3>
            <AppAlert v-if="error" variant="danger" class="mb-3">{{ error }}</AppAlert>
            <AdForm :submitting="submitting" @submit="onSubmit">
              <template #cancel>
                <router-link class="btn btn-secondary" :to="{ name: 'home' }">Отмена</router-link>
              </template>
              <template #submit-label>Создать объявление</template>
            </AdForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createAd } from '@/api/adsService';
import { getErrorMessage } from '@/utils/authUtils';
import { buildAdFormData } from '@/utils/buildAdFormData';
import { useAuthGuard } from '@/composables/useAuthGuard';
import AdForm from '@/components/AdForm.vue';
import AppAlert from '@/components/AppAlert.vue';
import type { AdSubmitPayload } from '@/types';

const router = useRouter();
const { auth } = useAuthGuard();
const error = ref('');
const submitting = ref(false);

async function onSubmit(payload: AdSubmitPayload) {
  if (auth.userIsBlocked) {
    error.value = 'Вы заблокированы и не можете создавать объявления';
    return;
  }
  submitting.value = true;
  error.value = '';
  try {
    await createAd(buildAdFormData({ ...payload, isCreate: true }));
    await router.replace({ name: 'home', query: { success: 'ad_created' } });
  } catch (e) {
    error.value = getErrorMessage(e, 'Ошибка при создании объявления');
  } finally {
    submitting.value = false;
  }
}
</script>

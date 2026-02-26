<template>
  <div class="container py-4">
    <h2 class="mb-4">Управление пользователями</h2>

    <div class="mb-3">
      <button class="btn btn-sm btn-outline-secondary" @click="loadUsers" :disabled="loading">Обновить список</button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Блокировка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.login }}</td>
            <td>{{ u.isBlocked ? 'Да' : 'Нет' }}</td>
            <td>
              <button
                class="btn btn-sm"
                :class="u.isBlocked ? 'btn-success' : 'btn-danger'"
                @click="toggleBlock(u)"
                :disabled="actionLoading[u.id]"
              >
                {{ u.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="alert alert-secondary">Пользователей не найдено.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { listUsers, blockUser, unblockUser } from '@/api/userService';
import { useAbortable } from '@/composables/useAbortable';
import type { UserProfile } from '@/types';

const users = ref<UserProfile[]>([]);
const actionLoading = ref<Record<number, boolean>>({});
const { loading, run } = useAbortable('Не удалось получить список пользователей');

async function loadUsers() {
  try {
    const res = await run(() => listUsers());
    if (res) users.value = res.data || [];
  } catch (e) {
    users.value = [];
  }
}

async function toggleBlock(user: UserProfile) {
  if (!user.id) return;
  actionLoading.value[user.id] = true;
  try {
    if (user.isBlocked) {
      await unblockUser(user.id);
    } else {
      await blockUser(user.id);
    }
    await loadUsers();
  } catch (e) {
    console.error(e);
  } finally {
    actionLoading.value[user.id] = false;
  }
}

// initial load
loadUsers();
</script>

<style scoped>
.table td, .table th { vertical-align: middle; }
</style>
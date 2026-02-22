/**
 * @file Entry point приложения
 * 
 * Создаёт Vue приложение и инициализирует:
 * - Pinia store для управления состоянием
 * - Vue Router для навигации
 * - Состояние аутентификации перед монтированием
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/authStore';

/**
 * Создаём Vue приложение
 */
const app = createApp(App);

/**
 * Инициализируем Pinia store
 */
const pinia = createPinia();
app.use(pinia);

/**
 * Инициализируем router
 */
app.use(router);

/**
 * Инициализируем состояние аутентификации перед монтированием
 * Восстанавливаем сохранённый токен из localStorage
 * Это позволяет пользователю остаться авторизованным после перезагрузки страницы
 */
(async () => {
  try {
    const auth = useAuthStore(pinia);
    await auth.init();
  } catch (err) {
    console.error('Failed to initialize authentication:', err);
    // Продолжаем загрузку даже если инициализация не удалась
  } finally {
    // Монтируем приложение в DOM
    app.mount('#app');
  }
})();

// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/authStore'; // относительный путь к файлу

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

(async () => {
  try {
    // useAuthStore(pinia) — допустимо, т.к. pinia уже зарегистрирован
    const auth = useAuthStore(pinia);
    await auth.init(); // ожидаем инициализацию токена/профиля
  } catch (err) {
    // логируем, но не блокируем монтирование
    // console.error('Auth init failed', err);
  } finally {
    app.mount('#app');
  }
})();

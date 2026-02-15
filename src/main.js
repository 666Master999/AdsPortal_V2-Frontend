// frontend/src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// ensure auth store is initialized before mount
(async () => {
  const auth = useAuthStore(pinia);
  await auth.init();
  app.mount('#app');
})();

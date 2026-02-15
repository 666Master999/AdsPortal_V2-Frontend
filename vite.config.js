import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      // если твой бэкенд на порту 5000, запросы типа /api/... уйдут туда
      '/api': {
        target: 'https://localhost:7145', // теперь HTTPS
        secure: false, // отключаем проверку сертификата (для самоподписанного)
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // если надо убрать /api
      }
    }
  }
});
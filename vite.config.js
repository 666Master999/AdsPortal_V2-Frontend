// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    historyApiFallback: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7145',
        secure: false,
        changeOrigin: true
      }
    }
  }
});

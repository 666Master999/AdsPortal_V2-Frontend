/**
 * @file Vite конфигурация
 * 
 * Настройки build, resolve aliases, и development server
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

/**
 * https://vitejs.dev/config/
 */
export default defineConfig({
  /**
   * Базовая папка для static файлов
   * ./ означает relative path к root проекта
   */
  base: './',

  /**
   * Vue plugin для обработки .vue файлов
   */
  plugins: [vue()],

  /**
   * Resolutions и alias для импортов
   */
  resolve: {
    /**
     * @ alias указывает на папку src/
     * Позволяет писать @/components вместо ../../components
     */
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  /**
   * Dev server конфигурация
   */
  server: {
    /**
     * Порт development сервера
     */
    port: 5173,

    /**
     * Proxy для API запросов в dev режиме
     * Все запросы на /api/ перенаправляются на backend
     */
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'https://localhost:7145',
        secure: false,
        changeOrigin: true
      }
    }
  },

  /**
   * Build конфигурация
   */
  build: {
    /**
     * Минимальный размер для превращения в отдельный chunk
     */
    chunkSizeWarningLimit: 500,

    /**
     * Sourcemaps для production (для отладки)
     * Установите на false если не нужны
     */
    sourcemap: false
  }
});

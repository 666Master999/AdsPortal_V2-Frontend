/**
 * @file Vite конфигурация
 * 
 * Настройки build, resolve aliases, и development server
 */

import { defineConfig } from 'vite';
import type { Connect } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

/**
 * https://vitejs.dev/config/
 */
export default defineConfig(({ command }) => ({
  /**
   * Базовая папка для static файлов
   * ./ означает relative path к root проекта
   */
  base: './',

  /**
   * Vue plugin для обработки .vue файлов
   */
  plugins: [vue()],
  // Plugin to add no-cache middleware in dev
  ...((() => {
    const devNoCachePlugin = {
      name: 'dev-no-cache-middleware',
      configureServer(server: any) {
        server.middlewares.use((req: Connect.IncomingMessage, res: Connect.ServerResponse, next: Connect.NextFunction) => {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          next();
        });
      }
    };
    return [devNoCachePlugin];
  })()),

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
  server: command === 'serve' ? {
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
    },
    // Ensure responses are sent with no-cache headers via middleware
    // (some setups ignore `headers` config; middleware enforces it)
    middlewareMode: false
  } : {
    // production server placeholder (Vite devServer not used in production)
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

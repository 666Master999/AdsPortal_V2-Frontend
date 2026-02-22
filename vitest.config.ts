/**
 * @file Vitest конфигурация
 * 
 * Настройки для unit и integration тестов
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

/**
 * https://vitest.dev/config/
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      /**
       * Использовать глобальные переменные (describe, it, expect без импорта)
       */
      globals: true,

      /**
       * Окружение для запуска тестов (jsdom симулирует браузер)
       */
      environment: 'jsdom',

      /**
       * Паттерны для поиска тест файлов
       * Поддерживает .test.ts, .spec.ts и т.д.
       */
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],

      /**
       * Покрытие кода (тестовое покрытие)
       * Используйте: npm run coverage
       */
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/main.ts',
          '**/*.d.ts',
          '**/types/**'
        ]
      }
    }
  })
);

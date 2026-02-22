/**
 * ESLint конфигурация для проекта
 * Поддерживает JavaScript, TypeScript и Vue компоненты
 */

import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  // JavaScript рекомендуемые правила
  js.configs.recommended,

  // Vue.js рекомендуемые правила
  ...vue.configs['flat/recommended'],

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Отключаем правило о многословных именах компонентов
      'vue/multi-word-component-names': 'off',

      // Vue специфичные правила
      'vue/script-setup-uses-vars': 'warn',

      // Общие правила
      'no-unused-vars': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',

      // Стиль кода
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'never'],
      'no-trailing-spaces': 'warn'
    }
  },

  // TypeScript файлы (при необходимости добавить @typescript-eslint)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unused-vars': 'off'
    }
  }
];

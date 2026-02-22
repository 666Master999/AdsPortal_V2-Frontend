/**
 * @file Vue Router конфигурация
 * 
 * Определяет маршруты приложения и защиту маршрутов на основе аутентификации
 */

import { createRouter, createWebHistory, RouteRecordRaw, Router } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import { useAuthStore } from '@/stores/authStore';

/**
 * Ленивзагрузка компонентов для оптимизации бандла
 */
const Login = () => import('@/pages/Login.vue');
const Register = () => import('@/pages/Register.vue');
const Profile = () => import('@/pages/Profile.vue');
const UserProfile = () => import('@/pages/UserProfile.vue');
const CreateAd = () => import('@/pages/CreateAd.vue');

/**
 * Расширенные метаданные маршрута
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** Требует авторизации для доступа */
    requiresAuth?: boolean;
    /** Только для неавторизованных пользователей (гостей) */
    guestOnly?: boolean;
    /** Название страницы для title */
    title?: string;
  }
}

/**
 * Определение маршрутов приложения
 * 
 * Структура:
 * - / - Главная страница (доступна всем)
 * - /login - Вход (только для гостей)
 * - /register - Регистрация (только для гостей)
 * - /profile/edit - Редактор профиля текущего пользователя (требует авторизации)
 * - /profiles/:id - Профиль других пользователей (требует авторизации)
 * - /ads/create - Создание объявления (требует авторизации)
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Главная'
    }
  },

  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      guestOnly: true,
      title: 'Вход'
    }
  },

  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      guestOnly: true,
      title: 'Регистрация'
    }
  },

  {
    path: '/profile/edit',
    name: 'profileEdit',
    component: Profile,
    meta: {
      requiresAuth: true,
      title: 'Редактирование профиля'
    }
  },

  {
    path: '/profiles/:id',
    name: 'userProfile',
    component: UserProfile,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Профиль пользователя'
    }
  },

  {
    path: '/ads/create',
    name: 'createAd',
    component: CreateAd,
    meta: {
      requiresAuth: true,
      title: 'Создание объявления'
    }
  }
];

/**
 * Создание router instance
 */
const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

/**
 * Глобальный navigation guard для защиты маршрутов
 * Проверяет:
 * - Требование авторизации (requiresAuth)
 * - Доступ только для гостей (guestOnly)
 * - Инициализирует состояние аутентификации
 * 
 * @example
 * Маршрут требует авторизации:
 * - Если пользователь не авторизован → редирект на /login
 * 
 * Маршрут только для гостей:
 * - Если пользователь авторизован → редирект на /
 */
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  try {
    // Инициализируем состояние аутентификации (восстанавливаем из localStorage)
    await auth.init();
  } catch (err) {
    console.warn('Auth initialization failed in router guard:', err);
  }

  const requiresAuth = !!to.meta?.requiresAuth;
  const guestOnly = !!to.meta?.guestOnly;

  // Проверка: маршрут требует авторизации, а пользователь не авторизован
  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' });
  }

  // Проверка: маршрут только для гостей, а пользователь авторизован
  if (guestOnly && auth.isAuthenticated) {
    return next({ name: 'home' });
  }

  // Все проверки пройдены — переходим на маршрут
  next();
});

/**
 * After hook для обновления title страницы
 */
router.afterEach((to) => {
  // Обновляем title документа
  document.title = `${to.meta?.title || 'Страница'} - AdsPortal V2`;
});

export default router;

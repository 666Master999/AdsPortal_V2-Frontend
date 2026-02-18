import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
const Login = () => import('../pages/Login.vue');
const Register = () => import('../pages/Register.vue');
const UserProfile = () => import('../pages/UserProfile.vue');

import { useAuthStore } from '../stores/authStore';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
  // просмотр профиля по publicId (numeric)
  { path: '/users/:id', name: 'userProfile', component: UserProfile, props: true }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (!auth.initialized) {
    try {
      await auth.init();
    } catch (err) {
      console.warn('Auth init failed in router guard', err);
    }
  }

  const requiresAuth = !!to.meta?.requiresAuth;
  const guestOnly = !!to.meta?.guestOnly;

  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' });
  }

  if (guestOnly && auth.isAuthenticated) {
    return next({ name: 'home' });
  }

  return next();
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
const Login = () => import('../pages/Login.vue');
const Register = () => import('../pages/Register.vue');
const Profile = () => import('../pages/Profile.vue');
const UserProfile = () => import('../pages/UserProfile.vue');
const CreateAd = () => import('../pages/CreateAd.vue');

import { useAuthStore } from '../stores/authStore';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
  // Свой профиль (редактирование) — только для авторизованных
  { path: '/profile/edit', name: 'profileEdit', component: Profile, meta: { requiresAuth: true } },
  // Профили других пользователей (просмотр) — только для авторизованных
  { path: '/profiles/:id', name: 'userProfile', component: UserProfile, props: true, meta: { requiresAuth: true } },
  { path: '/ads/create', name: 'createAd', component: CreateAd, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  try {
    await auth.init();
  } catch (err) {
    console.warn('Auth init failed in router guard', err);
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

// frontend/src/api/auth.js
import { useAuthStore } from '../stores/authStore';

export default {
  register(payload) {
    const authStore = useAuthStore(); // ✅ вызываем здесь
    return authStore.api.post('/api/auth/register', payload);
  },
  login(payload) {
    const authStore = useAuthStore(); // ✅ и здесь
    return authStore.api.post('/api/auth/login', payload);
  }
};
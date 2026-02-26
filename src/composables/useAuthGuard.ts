/**
 * Composable для проверки авторизации внутри страниц.
 * Инкапсулирует auth.init() + redirect + blocked check.
 */
import { useRouter } from 'vue-router';
import { useAuthStore, type AuthStore } from '@/stores/authStore';

export function useAuthGuard(opts: { redirectTo?: string; blockedMessage?: string } = {}) {
  const router = useRouter();
  const auth = useAuthStore() as AuthStore;
  const { redirectTo = 'login', blockedMessage = 'Вы заблокированы' } = opts;

  async function guard() {
    await auth.init();
    if (!auth.isAuthenticated) {
      router.replace({ name: redirectTo });
      return { ok: false as const, error: 'Требуется авторизация' };
    }
    if (auth.userIsBlocked) return { ok: false as const, error: blockedMessage };
    return { ok: true as const, error: '' };
  }

  return { guard, auth };
}

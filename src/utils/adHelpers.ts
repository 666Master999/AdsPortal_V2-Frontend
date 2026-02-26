/**
 * @file Общие хелперы для работы с объявлениями
 *
 * Используются в AdCard, AdDetails и других компонентах,
 * чтобы не дублировать логику нормализации изображений, типов и цен.
 */

import { API_BASE_URL } from '@/config/apiConfig';
import { formatPrice } from '@/utils/format';
import type { Advertisement } from '@/types';

/**
 * Приводит относительный URL изображения к абсолютному,
 * добавляя базовый URL API при необходимости.
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return url.startsWith('/') ? base + url : `${base}/${url}`;
}

/** Приводит тип объявления к числу (0 | 1 | 2) или undefined. */
export function resolveAdType(ad: Advertisement): number | undefined {
  const t = ad.type ?? (ad as any).category ?? undefined;
  if (t === undefined || t === null) return undefined;
  if (typeof t === 'number') return t;
  if (t === 'Sell') return 0;
  if (t === 'Buy') return 1;
  const n = Number(t);
  return Number.isNaN(n) ? undefined : n;
}

/** Человеко-читаемая метка типа объявления. */
export function adTypeLabel(ad: Advertisement): string {
  const t = resolveAdType(ad);
  if (t === 0) return 'Продам';
  if (t === 1) return 'Куплю';
  if (t === 2) return 'Услуги';
  return '—';
}

/** Форматирует цену объявления с учётом флагов «Договорная» / «Бесплатно». */
export function displayPrice(ad: Advertisement | null): string {
  if (!ad) return '—';
  if (ad.isNegotiable) return 'Договорная';
  if (ad.price === 0) return 'Бесплатно';
  return formatPrice(ad.price ?? undefined);
}

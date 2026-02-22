// src/utils/format.js
export function formatDate(val) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString();
  } catch {
    return val;
  }
}

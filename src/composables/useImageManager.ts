import { ref } from 'vue';

export interface Preview { id: string; url: string; }

export function useImageManager(maxFiles = 10) {
  const files = ref<File[]>([]);
  const previews = ref<Preview[]>([]);
  const mainIndex = ref(0);

  function rebuild() {
    const list = files.value.map(f => ({ id: String(Math.random()), url: URL.createObjectURL(f) }));
    previews.value.forEach(p => { try { URL.revokeObjectURL(p.url); } catch {} });
    previews.value.splice(0, previews.value.length, ...list);
    if (files.value.length === 0) mainIndex.value = 0;
  }

  function add(raw: File[]) {
    const allowed: File[] = [];
    const MAX_SIZE = 10 * 1024 * 1024;
    for (const f of raw.slice(0, maxFiles)) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > MAX_SIZE) continue;
      allowed.push(f);
    }
    files.value = [...files.value, ...allowed].slice(0, maxFiles);
    rebuild();
  }

  function clear() {
    files.value = [];
    rebuild();
  }

  function remove(idx: number) {
    files.value.splice(idx, 1);
    rebuild();
    if (mainIndex.value >= files.value.length) mainIndex.value = Math.max(0, files.value.length - 1);
  }

  function setMain(idx: number) {
    mainIndex.value = idx;
  }

  function reorder(src: number, dest: number) {
    if (src === dest) return;
    const f = files.value.splice(src, 1)[0];
    files.value.splice(dest, 0, f);
    rebuild();
    if (mainIndex.value === src) mainIndex.value = dest;
    else if (mainIndex.value > src && mainIndex.value <= dest) mainIndex.value--;
    else if (mainIndex.value < src && mainIndex.value >= dest) mainIndex.value++;
  }

  return { files, previews, mainIndex, add, clear, remove, setMain, reorder };
}

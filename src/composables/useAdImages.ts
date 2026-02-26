import { ref, watch } from 'vue';
import type { AdImage } from '@/types';

// Re-export for consumers that imported AdImage from here
export type { AdImage } from '@/types';

/** Управление коллекцией existing + new изображений с ordering, main и removals. */
export function useAdImages(maxFiles = 10) {
  const images = ref<AdImage[]>([]);
  const removedImageIds = ref<number[]>([]);
  const mainIndex = ref(0);

  function revokeUrl(url: string) {
    if (url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    }
  }

  function clear() {
    images.value.forEach((img: AdImage) => revokeUrl(img.url));
    images.value = [];
    removedImageIds.value = [];
    mainIndex.value = 0;
  }

  function loadExisting(list: Array<{ id?: number; url: string }>) {
    // revoke any object URLs produced earlier for new files
    images.value.forEach((img: AdImage) => {
      if (img.isNew) revokeUrl(img.url);
    });
    images.value = list.map((i, idx) => ({
      tempId: String(i.id ?? idx),
      id: i.id,
      url: i.url,
      isNew: false
    }));
    removedImageIds.value = [];
    mainIndex.value = 0;
  }

  function normalizeFiles(fileList: FileList | null | undefined) {
    if (!fileList?.length) return [] as File[];
    return Array.from(fileList);
  }

  function addNewFiles(raw: File[]) {
    const MAX_SIZE = 10 * 1024 * 1024;
    const allowed: File[] = [];
    for (const f of raw.slice(0, maxFiles)) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > MAX_SIZE) continue;
      allowed.push(f);
    }
    allowed.forEach((f) => {
      images.value.push({
        tempId: String(Math.random()),
        url: URL.createObjectURL(f),
        file: f,
        isNew: true
      });
    });
  }

  function removeImage(idx: number) {
    const img = images.value[idx];
    if (!img) return;
    if (!img.isNew && img.id !== undefined) {
      removedImageIds.value.push(img.id);
    }
    if (img.isNew) revokeUrl(img.url);
    images.value.splice(idx, 1);
    if (mainIndex.value === idx) {
      mainIndex.value = 0;
    } else if (mainIndex.value > idx) {
      mainIndex.value--;
    }
  }

  function setMain(idx: number) {
    if (idx >= 0 && idx < images.value.length) {
      mainIndex.value = idx;
    }
  }

  function reorder(src: number, dest: number) {
    if (src === dest) return;
    const item = images.value.splice(src, 1)[0];
    images.value.splice(dest, 0, item);
    if (mainIndex.value === src) {
      mainIndex.value = dest;
    } else if (mainIndex.value > src && mainIndex.value <= dest) {
      mainIndex.value--;
    } else if (mainIndex.value < src && mainIndex.value >= dest) {
      mainIndex.value++;
    }
  }

  watch(images, () => {
    if (mainIndex.value >= images.value.length) {
      mainIndex.value = Math.max(0, images.value.length - 1);
    }
  });

  return {
    images,
    removedImageIds,
    mainIndex,
    clear,
    loadExisting,
    normalizeFiles,
    addNewFiles,
    removeImage,
    setMain,
    reorder
  };
}

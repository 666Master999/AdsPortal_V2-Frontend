/** Единая сборка FormData для create/update объявления. */
import type { AdFormData, AdImage } from '@/types';

export interface BuildFormDataOptions {
  form: AdFormData;
  images: AdImage[];
  removedImageIds?: number[];
  mainIndex: number;
  /** true → create (поле `images`), false → update (`NewImages` и пр.) */
  isCreate?: boolean;
}

export function buildAdFormData(opts: BuildFormDataOptions): FormData {
  const { form, images, removedImageIds = [], mainIndex, isCreate } = opts;
  const fd = new FormData();

  if (form.type != null) fd.append('Type', String(form.type));
  fd.append('Title', form.title);
  if (form.description) fd.append('Description', form.description);
  
  // Всегда отправляем Price, так как он [Required] decimal (не nullable)
  fd.append('Price', String(form.price ?? 0));
  fd.append('IsNegotiable', form.negotiable ? 'true' : 'false');

  if (isCreate) {
    const files = images.filter(i => i.isNew && i.file).map(i => i.file!);
    if (mainIndex > 0 && mainIndex < files.length) files.unshift(files.splice(mainIndex, 1)[0]);
    files.forEach(f => fd.append('images', f));
  } else {
    const newItems = images.filter(i => i.isNew && i.file);
    const existingItems = images.filter(i => !i.isNew);
    const mainImg = images[mainIndex];
    const newMain = mainImg?.isNew === true;

    const orderedNew = (() => {
      const files = newItems.map(i => i.file!);
      if (newMain) { const idx = newItems.indexOf(mainImg); if (idx > 0) files.unshift(files.splice(idx, 1)[0]); }
      return files;
    })();

    if (newMain && existingItems.length) orderedNew.forEach(f => fd.append('NewImages', f));
    removedImageIds.forEach(id => fd.append('DeleteImageIds', String(id)));
    if (mainImg && !mainImg.isNew && mainImg.id != null) fd.append('MainImageId', String(mainImg.id));
    existingItems.forEach(i => { if (i.id != null) fd.append('ImageOrder', String(i.id)); });
    if (!(newMain && existingItems.length)) orderedNew.forEach(f => fd.append('NewImages', f));
  }

  return fd;
}

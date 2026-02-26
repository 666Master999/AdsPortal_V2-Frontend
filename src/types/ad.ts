/** Типы, связанные с объявлениями */

export enum AdType { Sell = 0, Buy = 1, Service = 2 }

export const AD_TYPE_LABELS: Record<AdType, string> = {
  [AdType.Sell]: 'Продам',
  [AdType.Buy]: 'Куплю',
  [AdType.Service]: 'Услуги'
};

/** Изображение в коллекции: новое (File) или существующее (серверный id). */
export interface AdImage {
  tempId: string;
  id?: number;
  url: string;
  file?: File;
  isNew: boolean;
}

/** Данные формы создания/редактирования объявления. */
export interface AdFormData {
  type: number | null;
  title: string;
  description: string;
  price: number | null;
  negotiable: boolean;
  free: boolean;
}

/** Payload, эмитируемый AdForm при отправке. */
export interface AdSubmitPayload {
  form: AdFormData;
  images: AdImage[];
  removedImageIds: number[];
  mainIndex: number;
}

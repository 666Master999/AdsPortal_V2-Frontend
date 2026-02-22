import { computed, reactive } from 'vue';

type ValidatorResult = { isValid: boolean; error?: string };
type Validator<T> = (model: T) => ValidatorResult;

/**
 * Простая обёртка для валидации форм.
 * Хранит ошибки в reactive-объекте и отдаёт удобные методы.
 */
export function useFormValidation<T extends Record<string, any>>(
  validators: Record<keyof T, Validator<T>>
) {
  const errors = reactive<Record<string, string>>({});

  function validateField(model: T, field: keyof T): void {
    const result = validators[field](model);
    if (result.isValid) delete errors[field as string];
    else errors[field as string] = result.error || 'Не заполнено';
  }

  function validateAll(model: T): boolean {
    (Object.keys(validators) as Array<keyof T>).forEach((key) => validateField(model, key));
    return Object.keys(errors).length === 0;
  }

  const isValid = computed(() => Object.keys(errors).length === 0);

  return {
    errors,
    isValid,
    validateField,
    validateAll
  };
}

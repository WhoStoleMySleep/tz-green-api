const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 15;
const RU_LOCAL_LENGTH = 11;

/**
 * Приводит ввод к международному формату без «+»: 8 (999) 123-45-67 → 79991234567.
 * Возвращает null, если цифр слишком мало или много для номера.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < MIN_PHONE_LENGTH || digits.length > MAX_PHONE_LENGTH) return null;
  if (digits.length === RU_LOCAL_LENGTH && digits.startsWith("8")) return `7${digits.slice(1)}`;
  return digits;
}

/** Российский номер — в привычном виде, остальные просто с «+». */
export function formatPhone(phone: string): string {
  const match = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  if (!match) return `+${phone}`;
  const [, code, first, second, third] = match;
  return `+7 ${code} ${first}-${second}-${third}`;
}

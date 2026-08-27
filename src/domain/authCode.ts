export const EMAIL_CODE_MAX_LENGTH = 8;

export function normalizeEmailCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, EMAIL_CODE_MAX_LENGTH);
}

export function isValidEmailCode(value: string): boolean {
  return /^\d{6,8}$/.test(value);
}

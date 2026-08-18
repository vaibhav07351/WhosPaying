import { MAX_NAME_LENGTH } from '../theme';

/** Letters, numbers, spaces, and common name punctuation only. */
const ALLOWED_CHARS = /[^\p{L}\p{N}\s'.-]/gu;
const EMOJI_AND_SYMBOLS = /\p{Extended_Pictographic}|[\uFE0F\u200D]/gu;
const CONTROL_CHARS = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const BULK_FORBIDDEN = /[^\p{L}\p{N}\s'.,;\-\n]/gu;
const MULTI_SPACE = /\s+/g;
const HAS_LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
const ONLY_PUNCT_OR_SPACE = /^[\s'.-]+$/u;

export type NameRejectReason =
  | 'empty'
  | 'too_short'
  | 'invalid'
  | 'too_long';

export type NameSanitizeResult = {
  readonly value: string;
  readonly stripped: boolean;
};

/**
 * Live filter for the text field: drop emojis, symbols, and control chars.
 * Keeps letters from any language, digits, spaces, apostrophe, hyphen, period.
 */
export function sanitizeNameInput(raw: string): NameSanitizeResult {
  const before: string = raw;
  let next: string = raw
    .replace(CONTROL_CHARS, '')
    .replace(EMOJI_AND_SYMBOLS, '')
    .replace(ALLOWED_CHARS, '');
  if (next.length > MAX_NAME_LENGTH) {
    next = next.slice(0, MAX_NAME_LENGTH);
  }
  return { value: next, stripped: next !== before };
}

/**
 * Final normalize before saving: trim, collapse spaces, enforce length.
 */
export function normalizeName(raw: string): string {
  return sanitizeNameInput(raw)
    .value.replace(MULTI_SPACE, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

export function validateNormalizedName(name: string): NameRejectReason | null {
  if (name.length === 0) {
    return 'empty';
  }
  if (name.length < 2) {
    return 'too_short';
  }
  if (ONLY_PUNCT_OR_SPACE.test(name) || !HAS_LETTER_OR_DIGIT.test(name)) {
    return 'invalid';
  }
  if (name.length > MAX_NAME_LENGTH) {
    return 'too_long';
  }
  return null;
}

export function namesMatch(a: string, b: string): boolean {
  return a.toLocaleLowerCase() === b.toLocaleLowerCase();
}

export function isPersistablePerson(value: unknown): value is {
  readonly id: string;
  readonly name: string;
} {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record: Record<string, unknown> = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.name !== 'string') {
    return false;
  }
  const name: string = normalizeName(record.name);
  return validateNormalizedName(name) === null;
}

export function sanitizeBulkInput(raw: string): string {
  return raw
    .replace(CONTROL_CHARS, '')
    .replace(EMOJI_AND_SYMBOLS, '')
    .replace(BULK_FORBIDDEN, '');
}

export function splitBulkNames(raw: string): string[] {
  return sanitizeBulkInput(raw)
    .split(/[,;\n]+/)
    .map((part: string) => part.trim())
    .filter((part: string) => part.length > 0);
}

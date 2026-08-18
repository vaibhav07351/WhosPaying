import { MAX_NAME_LENGTH } from '../theme';
import type { AddManyResult, AddNameResult } from '../types';

export function errorMessage(
  reason: Extract<AddNameResult, { ok: false }>['reason'],
): string {
  switch (reason) {
    case 'duplicate':
      return 'That name is already on the wheel.';
    case 'limit':
      return 'The wheel is full. Remove someone first.';
    case 'too_short':
      return 'Use at least 2 characters.';
    case 'invalid':
      return 'Enter a real name, not only symbols.';
    case 'too_long':
      return `Keep names to ${MAX_NAME_LENGTH} characters.`;
    case 'empty':
    default:
      return 'Type a name first.';
  }
}

export function bulkMessage(summary: AddManyResult): string | null {
  if (summary.added === 0 && summary.skippedInvalid > 0 && summary.skippedDuplicate === 0) {
    return 'Could not add those. Use letters or numbers, 2+ characters.';
  }
  if (summary.added === 0 && summary.skippedDuplicate > 0) {
    return 'Those names are already on the wheel.';
  }
  if (summary.added === 0 && summary.skippedLimit > 0) {
    return 'The wheel is full. Remove someone first.';
  }
  if (summary.added === 0) {
    return 'Add names separated by commas or new lines.';
  }
  const extras: string[] = [];
  if (summary.skippedDuplicate > 0) {
    extras.push(`${summary.skippedDuplicate} duplicate`);
  }
  if (summary.skippedInvalid > 0) {
    extras.push(`${summary.skippedInvalid} skipped`);
  }
  if (summary.skippedLimit > 0) {
    extras.push('wheel is full');
  }
  if (extras.length === 0) {
    return null;
  }
  return `Added ${summary.added}. ${extras.join(', ')}.`;
}

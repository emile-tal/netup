/** Upper-cases the first character. Used for field labels ("notes" → "Notes"). */
export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Splits a camel/pascal key into words ("firstName" → "First name"). */
export function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return capitalize(spaced);
}

/** "Emile Tal" — drops the missing half rather than leaving a stray space. */
export function fullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/** Up to two letters for an avatar ("Emile Tal" → "ET"). Falls back to "?". */
export function initials(firstName?: string, lastName?: string): string {
  const letters = [firstName, lastName]
    .map(part => part?.trim().charAt(0) ?? '')
    .filter(Boolean)
    .join('');
  return letters ? letters.slice(0, 2).toUpperCase() : '?';
}

// Shared date helpers. Dates are epoch-ms in the DB and JS `Date` in the DTOs
// (see db/repo/*), so everything here works on `Date`.

/** Midnight (local) of the given date — the canonical "day" for reminders. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** Stable key for grouping/looking up by day (`YYYY-MM-DD`, local time). */
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `Sep 10, 2025` — used by the profile cards. */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** `Today` / `Tomorrow` / `Monday, September 10` — used by the agenda headers. */
export function formatRelativeDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** `YYYY-MM-DD` for text inputs (same shape as `toDayKey`, named for intent). */
export function toDateInputValue(date?: Date): string {
  return date ? toDayKey(date) : '';
}

/**
 * Parses a `YYYY-MM-DD` text input into a local-midnight `Date`.
 * Returns `undefined` for empty/partial/invalid input so the caller can clear the field.
 */
export function parseDateInputValue(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;

  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // Reject overflow like 2025-02-31, which `Date` would silently roll forward.
  if (date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) return undefined;
  return date;
}

// Shared date helpers. Dates are epoch-ms in the DB and JS `Date` in the DTOs
// (see db/repo/*), so everything here works on `Date`.

/** Midnight (local) of the given date — the canonical "day" for outreach. */
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

/**
 * `just now` / `4 minutes ago` / `2 hours ago` / `3 days ago` — for timestamps in the
 * recent past, where the exact clock time matters less than the distance from now.
 */
export function formatTimeAgo(date: Date, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));

  if (seconds < 45) return 'just now';

  const plural = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? '' : 's'} ago`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return plural(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (hours < 24) return plural(hours, 'hour');

  return plural(Math.round(hours / 24), 'day');
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

const MONTH_NAMES = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

/** Local-midnight date, or `undefined` if the parts overflow (Feb 31, month 13). */
function dateFromParts(year: number, month: number, day = 1): Date | undefined {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return undefined;
  return date;
}

/** Excel's day 0 is 1899-12-30 (the 1900 leap-year bug folded in). */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parses a date the way a person (or a spreadsheet) writes one, for imports:
 * an Excel serial (`45717`), `2025-03-14`, `2025-03`, `03/2025`, `3/14/2025` (US order,
 * unless the first number can only be a day), `Mar 2025`, `March 14, 2025`, `14 March
 * 2025`. A value with no day lands on the 1st. Returns `undefined` when nothing matches.
 */
export function parseLooseDate(value: string): Date | undefined {
  const text = value.trim().toLowerCase();
  if (!text) return undefined;

  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Math.floor(Number(text));
    if (serial < 1 || serial > 100000) return undefined;
    const utc = new Date(EXCEL_EPOCH_UTC + serial * DAY_MS);
    return dateFromParts(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
  }

  let m = /^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?$/.exec(text);
  if (m) return dateFromParts(Number(m[1]), Number(m[2]), m[3] ? Number(m[3]) : 1);

  m = /^(\d{1,2})[-/.](\d{4})$/.exec(text);
  if (m) return dateFromParts(Number(m[2]), Number(m[1]));

  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(text);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return a > 12 ? dateFromParts(Number(m[3]), b, a) : dateFromParts(Number(m[3]), a, b);
  }

  const monthOf = (word: string) => {
    const index = MONTH_NAMES.indexOf(word.slice(0, 3));
    return index === -1 ? undefined : index + 1;
  };

  // `March 2025`, `Mar 14, 2025`
  m = /^([a-z]+)\.?\s+(?:(\d{1,2}),?\s+)?(\d{4})$/.exec(text);
  if (m && monthOf(m[1])) return dateFromParts(Number(m[3]), monthOf(m[1])!, m[2] ? Number(m[2]) : 1);

  // `14 March 2025`
  m = /^(\d{1,2})\s+([a-z]+)\.?,?\s+(\d{4})$/.exec(text);
  if (m && monthOf(m[2])) return dateFromParts(Number(m[3]), monthOf(m[2])!, Number(m[1]));

  return undefined;
}

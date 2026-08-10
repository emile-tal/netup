// The 5-15-50 config: one place that says what each circle is called, how often it wants
// contact, and how it is drawn. Everything else (the board, the profile card, the reminder
// generator in db/repo/outreach.ts) reads from here rather than restating a cadence.

import type { Tier } from '../types/contacts';
import { startOfDay } from './date';
import { fullName } from './string';

/** Column order on the board, and the only valid tier values. */
export const TIERS: readonly Tier[] = [5, 15, 50];

export const TIER_LABELS: Record<Tier, string> = {
  5: 'Inner circle',
  15: 'Trusted network',
  50: 'Strategic network',
};

export const TIER_CADENCE_LABELS: Record<Tier, string> = {
  5: 'Every 2 weeks',
  15: 'Monthly',
  50: 'Quarterly',
};

/**
 * How long after the last outreach the next one is due. Months rather than a day count
 * for 15/50 so "monthly" and "quarterly" land on the same day of the month.
 */
const TIER_INTERVALS: Record<Tier, { days?: number; months?: number }> = {
  5: { days: 14 },
  15: { months: 1 },
  50: { months: 3 },
};

/**
 * Tailwind classes per tier. Written as whole literal class strings because NativeWind
 * scans source text — a class assembled at runtime (`` `bg-tier-${slug}` ``) would never
 * be generated.
 */
export const TIER_STYLES: Record<Tier, { fill: string; wash: string; text: string }> = {
  5: { fill: 'bg-tier-inner', wash: 'bg-tier-inner-light', text: 'text-tier-inner' },
  15: {
    fill: 'bg-tier-trusted',
    wash: 'bg-tier-trusted-light',
    text: 'text-tier-trusted',
  },
  50: {
    fill: 'bg-tier-strategic',
    wash: 'bg-tier-strategic-light',
    text: 'text-tier-strategic',
  },
};

export function isTier(value: unknown): value is Tier {
  return value === 5 || value === 15 || value === 50;
}

/** Narrows the nullable `contacts.tier` column to a `Tier` (or `null` for unassigned). */
export function toTier(value?: number | null): Tier | null {
  return isTier(value) ? value : null;
}

/** Adds whole months, clamping the day so Jan 31 + 1 month is Feb 28, not Mar 3. */
function addMonths(date: Date, months: number): Date {
  const day = date.getDate();
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, daysInMonth));
  return result;
}

/**
 * When the next touch for this tier is due, counted from `from` — the last time the user
 * reached out, or today for someone they have never contacted (so tiering a new contact
 * schedules one full cadence out).
 *
 * Clamped to today: a cadence that lapsed while the contact sat untiered is due now, and
 * dating a freshly generated reminder in the past would bury it in the calendar.
 */
export function nextOutreachDate(tier: Tier, from: Date): Date {
  const interval = TIER_INTERVALS[tier];
  let due = startOfDay(from);
  if (interval.days) due.setDate(due.getDate() + interval.days);
  if (interval.months) due = addMonths(due, interval.months);

  const today = startOfDay(new Date());
  return due.getTime() < today.getTime() ? today : due;
}

/** Title for a generated outreach reminder. */
export function outreachTitle(firstName?: string, lastName?: string): string {
  const name = fullName(firstName, lastName);
  return name ? `Reach out to ${name}` : 'Reach out';
}

import type { Contact } from '../../types/contacts';

/**
 * The profile's field layout: one array per `Card` section, in render order. This is the
 * **only** place that order lives — `ProfileCard` walks these arrays rather than the
 * contact's own key order.
 *
 * It is also an allowlist: a key that isn't listed isn't rendered. `id`, `createdAt` and
 * `updatedAt` are not fields; the name, job title and company are drawn by
 * `ProfileKeyDataCard` at the top; and `lastOutreachAt` belongs to `ProfileTierCard`,
 * which renders it beside the circle it follows from.
 */
export const SECTIONS: readonly (readonly (keyof Contact)[])[] = [
  // How to reach them — the reason most contacts get opened at all.
  ['emails', 'phones'],
  // Who they are to you.
  ['tier', 'firstMeeting', 'source', 'alumni'],
  ['addresses'],
  ['notes'],
];

/**
 * Tagging a contact inside a piece of free text with `@`.
 *
 * A mention is **not** a separate field or a foreign key — it is the plain characters
 * `@First Last` sitting in the outreach title, exactly as typed. That is deliberate: the
 * title is one `text` column that the repo, the outbox and the sync wire already carry
 * unchanged (CLAUDE.md §19), so a mention costs no schema, no migration and no mapping.
 * The price is that a tag is only *recognised* while the contact still exists under that
 * name — which is the right trade here, since a renamed contact should stop matching
 * rather than leave a dangling id behind.
 *
 * Everything in this file is pure: the detection the editor runs on each keystroke, and
 * the segmentation the renderer uses to draw the tag bold + underlined.
 */

import type { ContactSummary } from '../types/contacts';
import { capitalize, fullName } from './string';

/** The character that opens a tag. */
export const MENTION_SIGIL = '@';

/** Longest list the popup shows at once; it scrolls past this. */
export const MENTION_MATCH_LIMIT = 8;

/** A tag the user is part-way through typing. */
export interface MentionQuery {
  /** Index of the `@` in the text. */
  start: number;
  /** What follows it — never empty, never contains whitespace. */
  query: string;
}

/**
 * The tag being typed at `caret`, or `null` if there isn't one.
 *
 * Three rules, all of them deliberate:
 * - **The `@` must open a word** (start of text, or whitespace before it), so an email
 *   address typed into a title never opens the popup.
 * - **At least one letter after it**, so a bare `@` is just a character.
 * - **No whitespace in the query**, which is what makes the spacebar close the popup
 *   without any explicit handling.
 */
export function findMentionQuery(text: string, caret: number): MentionQuery | null {
  const upToCaret = text.slice(0, Math.max(0, Math.min(caret, text.length)));
  const start = upToCaret.lastIndexOf(MENTION_SIGIL);
  if (start === -1) return null;
  if (start > 0 && !/\s/.test(text[start - 1])) return null;

  const query = upToCaret.slice(start + 1);
  if (query.length === 0 || /\s/.test(query)) return null;

  return { start, query };
}

/** How a contact is written into the text: "Sarah Smith", capitalized. */
export function mentionLabel(contact: {
  firstName?: string;
  lastName?: string;
}): string {
  return fullName(
    capitalize(contact.firstName?.trim() ?? ''),
    capitalize(contact.lastName?.trim() ?? '')
  );
}

/**
 * Contacts whose name contains `query`, case-insensitively, prefix matches first so
 * typing the first letters of a first or last name puts that contact at the top (and the
 * popup's default highlight on it).
 */
export function matchMentionContacts(
  contacts: ContactSummary[],
  query: string,
  limit = MENTION_MATCH_LIMIT
): ContactSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = contacts
    .map(contact => {
      const label = mentionLabel(contact);
      const lower = label.toLowerCase();
      if (!label || !lower.includes(q)) return null;
      // 0 = a word in the name starts with the query, 1 = it only appears inside one.
      const rank = lower.split(' ').some(part => part.startsWith(q)) ? 0 : 1;
      return { contact, label, rank };
    })
    .filter((entry): entry is { contact: ContactSummary; label: string; rank: number } =>
      entry !== null
    );

  scored.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));
  return scored.slice(0, limit).map(entry => entry.contact);
}

/**
 * Replaces the half-typed tag with the chosen contact, and reports where the caret goes.
 * A trailing space is added unless there already is one, so the user keeps typing the
 * sentence rather than landing glued to the name.
 */
export function applyMention(
  text: string,
  mention: MentionQuery,
  contact: ContactSummary
): { text: string; caret: number } {
  const before = text.slice(0, mention.start);
  const after = text.slice(mention.start + MENTION_SIGIL.length + mention.query.length);
  const spacer = /^\s/.test(after) ? '' : ' ';
  const inserted = `${MENTION_SIGIL}${mentionLabel(contact)}${spacer}`;

  return { text: `${before}${inserted}${after}`, caret: before.length + inserted.length };
}

/** One run of text, either prose or the name part of a recognised tag. */
export interface MentionSegment {
  text: string;
  mention: boolean;
}

/**
 * Splits text into prose and tag runs for rendering. Only names in `labels` match — an
 * `@` followed by anything else is prose — and longer names are tried first so
 * "Sarah Smithson" wins over "Sarah Smith".
 *
 * The `@` itself stays in the prose run: the bold + underline marks the *person*, and
 * carrying the sigil into it makes the underline look like a typo.
 */
export function splitMentions(text: string, labels: string[]): MentionSegment[] {
  const sorted = [...new Set(labels.filter(Boolean))].sort((a, b) => b.length - a.length);
  const segments: MentionSegment[] = [];
  const push = (run: string, mention: boolean) => {
    if (run) segments.push({ text: run, mention });
  };

  let plainStart = 0;
  let i = 0;
  while (i < text.length) {
    const opensWord = i === 0 || /\s/.test(text[i - 1]);
    if (text[i] === MENTION_SIGIL && opensWord && sorted.length > 0) {
      const rest = text.slice(i + 1).toLowerCase();
      const label = sorted.find(candidate => rest.startsWith(candidate.toLowerCase()));
      if (label) {
        push(text.slice(plainStart, i + 1), false);
        push(text.slice(i + 1, i + 1 + label.length), true);
        i += 1 + label.length;
        plainStart = i;
        continue;
      }
    }
    i += 1;
  }
  push(text.slice(plainStart), false);

  return segments;
}

/**
 * Where the caret ends up after a text change, derived by diffing. The web `TextInput`
 * only reports `onSelectionChange` when a *range* is selected — a caret move or a
 * keystroke does not fire it — so the editor cannot ask for the caret and has to work it
 * out from what changed.
 */
export function caretAfterChange(previous: string, next: string): number {
  const shared = Math.min(previous.length, next.length);
  let i = 0;
  while (i < shared && previous[i] === next[i]) i += 1;
  return i + Math.max(0, next.length - previous.length);
}

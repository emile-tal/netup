/**
 * Tagging a contact inside a piece of free text with `@`.
 *
 * A mention is **not** a separate field or a foreign key — it lives in the outreach title
 * itself, stored as `@[Sarah Smith](contact-id)`. The title is one `text` column that the
 * repo, the outbox and the sync wire already carry unchanged (CLAUDE.md §19), so a mention
 * costs no schema, no migration and no mapping. The **id is what a tag refers to**; the
 * name beside it is what gets drawn, so a preview can render a title without looking the
 * contact up. `refreshMentionNames` (db/repo/outreach.ts) rewrites that name on a rename.
 *
 * Nothing on screen shows the stored form. Editors work on a `MentionDraft` — the text
 * with each tag reduced to its name, plus the tags' ranges and ids — and the stored title
 * is re-derived from it on every change (`serializeMentions`). Holding the ranges, rather
 * than re-finding names in the shown text, is what lets a tag behave as one object.
 *
 * Everything in this file is pure.
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
 * A tag inside the shown text, as a half-open `[start, end)` range. The name is
 * `text.slice(start, end)`; `contactId` is who it refers to.
 */
export interface MentionTag {
  start: number;
  end: number;
  contactId: string;
}

/** What an editor works on: the title as shown, plus where its tags sit. */
export interface MentionDraft {
  text: string;
  tags: MentionTag[];
}

/** `]` closes the name and `\` escapes, so both are escaped inside it. */
const escapeName = (name: string) => name.replace(/[\\\]]/g, match => `\\${match}`);

/**
 * Reads one stored tag starting at `i`, or `null` if `@[name](id)` is not there. Malformed
 * input is never an error — it is just prose.
 */
function readTag(
  stored: string,
  i: number
): { name: string; contactId: string; length: number } | null {
  if (!stored.startsWith(`${MENTION_SIGIL}[`, i)) return null;
  let name = '';
  let j = i + 2;
  while (j < stored.length && stored[j] !== ']') {
    if (stored[j] === '\\' && j + 1 < stored.length) j += 1;
    name += stored[j];
    j += 1;
  }
  const id = /^\(([^)\s]+)\)/.exec(stored.slice(j + 1));
  if (j >= stored.length || !name || !id) return null;
  return { name, contactId: id[1], length: j + 1 + id[0].length - i };
}

/** Stored title → draft. Any `@` that is not a well-formed tag is prose. */
export function parseMentions(stored: string): MentionDraft {
  const tags: MentionTag[] = [];
  let text = '';
  let i = 0;
  while (i < stored.length) {
    const tag = stored[i] === MENTION_SIGIL ? readTag(stored, i) : null;
    if (tag) {
      tags.push({ start: text.length, end: text.length + tag.name.length, contactId: tag.contactId });
      text += tag.name;
      i += tag.length;
    } else {
      text += stored[i];
      i += 1;
    }
  }
  return { text, tags };
}

/** Draft → stored title. The inverse of `parseMentions`. */
export function serializeMentions({ text, tags }: MentionDraft): string {
  let out = '';
  let cursor = 0;
  for (const tag of tags) {
    const name = escapeName(text.slice(tag.start, tag.end));
    out += `${text.slice(cursor, tag.start)}${MENTION_SIGIL}[${name}](${tag.contactId})`;
    cursor = tag.end;
  }
  return out + text.slice(cursor);
}

/** The title as a person reads it — tags reduced to names. For dialogs and labels. */
export function mentionPlainText(stored: string): string {
  return parseMentions(stored).text;
}

/** One run of a title for rendering: prose, or a tag's name. */
export interface MentionSegment {
  text: string;
  contactId?: string;
}

/** Splits a draft into prose and tag runs, in order, dropping empty prose runs. */
export function mentionSegments({ text, tags }: MentionDraft): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let cursor = 0;
  for (const tag of tags) {
    if (tag.start > cursor) segments.push({ text: text.slice(cursor, tag.start) });
    segments.push({ text: text.slice(tag.start, tag.end), contactId: tag.contactId });
    cursor = tag.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

/**
 * Rewrites every tag of `contactId` in a stored title to show `name`, or returns `null`
 * when nothing changed — so a caller can skip the write.
 */
export function renameMentions(stored: string, contactId: string, name: string): string | null {
  const draft = parseMentions(stored);
  if (!name || !draft.tags.some(tag => tag.contactId === contactId)) return null;

  let text = '';
  let cursor = 0;
  const tags: MentionTag[] = [];
  for (const tag of draft.tags) {
    text += draft.text.slice(cursor, tag.start);
    const shown = tag.contactId === contactId ? name : draft.text.slice(tag.start, tag.end);
    tags.push({ start: text.length, end: text.length + shown.length, contactId: tag.contactId });
    text += shown;
    cursor = tag.end;
  }
  text += draft.text.slice(cursor);

  const next = serializeMentions({ text, tags });
  return next === stored ? null : next;
}

/** The tag the caret is strictly inside, if any — a caret at either edge is outside. */
export function mentionTagAt(tags: MentionTag[], caret: number): MentionTag | null {
  return tags.find(tag => tag.start < caret && caret < tag.end) ?? null;
}

/**
 * Replaces the half-typed `@query` with the chosen contact's name as a tag, and reports
 * where the caret goes. A trailing space is added unless there already is one, so the
 * user keeps typing the sentence rather than landing glued to the name.
 */
export function insertMention(
  draft: MentionDraft,
  mention: MentionQuery,
  contact: ContactSummary
): { draft: MentionDraft; caret: number } {
  const removedEnd = mention.start + MENTION_SIGIL.length + mention.query.length;
  const after = draft.text.slice(removedEnd);
  const name = mentionLabel(contact);
  const spacer = /^\s/.test(after) ? '' : ' ';
  const inserted = `${name}${spacer}`;
  const shift = inserted.length - (removedEnd - mention.start);

  const tags = [
    ...draft.tags.filter(tag => tag.end <= mention.start),
    { start: mention.start, end: mention.start + name.length, contactId: contact.id },
    ...draft.tags
      .filter(tag => tag.start >= removedEnd)
      .map(tag => ({ ...tag, start: tag.start + shift, end: tag.end + shift })),
  ];

  return {
    draft: { text: `${draft.text.slice(0, mention.start)}${inserted}${after}`, tags },
    caret: mention.start + inserted.length,
  };
}

/**
 * Applies a raw text change from the field to a draft, keeping **tags atomic**:
 *
 * - A deletion (or a replaced selection) that touches any part of a tag removes the whole
 *   tag — so Backspace at the end of "Sarah Smith" takes the name, not the "h".
 * - Typing strictly inside a tag turns it back into plain text: the name was edited, so
 *   it no longer refers to the contact.
 * - Typing at either edge of a tag leaves it alone.
 *
 * `caret` is where the caret sits in `next`, when the platform reports it. It anchors the
 * diff, which is otherwise ambiguous inside a run of repeated characters.
 *
 * `rewritten` is true when the result differs from `next` — the field then has to be told
 * where the caret goes, because its content was replaced underneath it.
 */
export function applyMentionEdit(
  draft: MentionDraft,
  next: string,
  caret = caretAfterChange(draft.text, next)
): { draft: MentionDraft; caret: number; rewritten: boolean } {
  const previous = draft.text;
  const shared = Math.min(previous.length, next.length);

  // The edit ends at the caret, so the unchanged tail can't reach past it.
  let suffix = 0;
  const suffixLimit = Math.min(shared, next.length - caret);
  while (
    suffix < suffixLimit &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  let prefix = 0;
  while (prefix < shared - suffix && previous[prefix] === next[prefix]) prefix += 1;

  let lo = prefix;
  let hi = previous.length - suffix;
  const inserted = next.slice(prefix, next.length - suffix);

  const dropped = new Set<MentionTag>();
  for (const tag of draft.tags) {
    if (lo < hi ? tag.start < hi && tag.end > lo : tag.start < lo && lo < tag.end) {
      dropped.add(tag);
    }
  }
  // Only a removal widens to the whole tag; an insertion inside one just demotes it.
  if (lo < hi) {
    for (const tag of dropped) {
      lo = Math.min(lo, tag.start);
      hi = Math.max(hi, tag.end);
    }
  }

  const text = `${previous.slice(0, lo)}${inserted}${previous.slice(hi)}`;
  const shift = inserted.length - (hi - lo);
  const tags = draft.tags
    .filter(tag => !dropped.has(tag))
    .map(tag =>
      tag.start >= hi ? { ...tag, start: tag.start + shift, end: tag.end + shift } : tag
    );

  return { draft: { text, tags }, caret: lo + inserted.length, rewritten: text !== next };
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

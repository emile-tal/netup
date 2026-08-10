import type { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import type { Tier } from '../../app/types/contacts';
import { nextOutreachDate, outreachTitle, toTier } from '../../app/utils/outreach';
import Contact from '../models/Contact';
import Reminder from '../models/Reminder';
import { markDeletedMeta, upsertMeta } from './metadata';
import { enqueueOutbox } from './outbox';

/**
 * The 5-15-50 cadence generator.
 *
 * The schedule is a *rolling horizon of one*: a tiered contact has exactly one open
 * generated reminder at a time, and completing it both resets the clock and queues the
 * next. Nothing is materialized further out, so a tier change is one row rewritten rather
 * than a year of rows regenerated — and because the generated rows are ordinary
 * `reminders`, the calendar and every write path already work on them unchanged.
 *
 * The lifecycle:
 * - assigned a tier → one reminder, one cadence after the last outreach (or today)
 * - completed       → `lastOutreachAt` = now, next reminder one cadence after now
 * - deleted         → read as "skip this touch"; the next is scheduled from today
 * - untiered        → the open reminder is removed
 *
 * Manually edited generated rows (a nudged date, a rewritten title) are left alone; only
 * a tier change, a completion or a delete re-derives the schedule.
 */

const AUTO: string = 'auto';

async function findContact(db: Database, id: string): Promise<Contact | null> {
  const rows = await db.get<Contact>('contacts').query(Q.where('id', id)).fetch();
  return rows[0] ?? null;
}

/**
 * A contact's generated reminders, split into the ones still open and all of them.
 *
 * `completed` is filtered in JS rather than in the query because it is an optional
 * boolean: the SQLite and LokiJS adapters do not agree on how a null column compares to
 * `false` (see CLAUDE.md §12), and the row counts here are single digits.
 */
async function autoReminders(db: Database, contactId: string) {
  const all = await db
    .get<Reminder>('reminders')
    .query(Q.where('contact_id', contactId), Q.where('origin', AUTO))
    .fetch();

  return { all, open: all.filter(row => !row.completed) };
}

/**
 * The date the next touch is counted from: the last recorded outreach, or today for a
 * contact who has never been contacted (so tiering them schedules one full cadence out
 * rather than making them immediately overdue).
 */
export function outreachAnchor(contact: Contact): Date {
  return contact.lastOutreachAt ? new Date(contact.lastOutreachAt) : new Date();
}

/**
 * Replaces the contact's open generated reminder with one due a cadence after `from`.
 * An untiered contact just loses theirs.
 *
 * Must run **inside** a `db.write(...)` — like `enqueueOutbox`, so the new reminder lands
 * in the same transaction as whatever caused it.
 */
export async function scheduleNextOutreach(db: Database, contactId: string, from: Date) {
  const contact = await findContact(db, contactId);
  if (!contact) return;

  const { open } = await autoReminders(db, contactId);

  // The horizon is exactly one touch, so every open generated row is superseded — the
  // loop also cleans up duplicates if one ever slipped through.
  for (const row of open) {
    await row.destroyPermanently();
    await markDeletedMeta(db, 'reminder', row.id);
    await enqueueOutbox(db, 'reminder', 'delete', { id: row.id });
  }

  const tier = toTier(contact.tier);
  if (!tier) return;

  const due = nextOutreachDate(tier, from);
  const title = outreachTitle(contact.firstName, contact.lastName);

  const created = await db.get<Reminder>('reminders').create((row: Reminder) => {
    row.title = title;
    row.dateTs = due.getTime();
    row.contactId = contactId;
    row.completed = false;
    row.origin = AUTO;
  });

  await upsertMeta(db, 'reminder', created.id);
  await enqueueOutbox(db, 'reminder', 'create', {
    id: created.id,
    contactId,
    title,
    date: due,
    completed: false,
    origin: AUTO,
  });
}

/**
 * Records that the user reached out at `at` and queues the next touch a cadence later.
 * This is the reset-on-completion rule: the rhythm restarts from the actual contact, so
 * reaching out early moves the whole schedule up.
 *
 * Must run inside a `db.write(...)`.
 */
export async function recordOutreach(db: Database, contactId: string, at: Date) {
  const contact = await findContact(db, contactId);
  if (!contact) return;

  await contact.update((row: Contact) => {
    row.lastOutreachAt = at.getTime();
  });

  await upsertMeta(db, 'contact', contactId);
  await enqueueOutbox(db, 'contact', 'update', { id: contactId, lastOutreachAt: at });

  await scheduleNextOutreach(db, contactId, at);
}

/**
 * Keeps generated titles in step with a rename, so "Reach out to Ann Lee" doesn't outlive
 * the name it was built from. Must run inside a `db.write(...)`.
 */
export async function refreshOutreachTitles(db: Database, contactId: string) {
  const contact = await findContact(db, contactId);
  if (!contact) return;

  const title = outreachTitle(contact.firstName, contact.lastName);
  const { all } = await autoReminders(db, contactId);

  for (const row of all) {
    if (row.title === title) continue;
    await row.update((r: Reminder) => {
      r.title = title;
    });
    await upsertMeta(db, 'reminder', row.id);
    await enqueueOutbox(db, 'reminder', 'update', { id: row.id, title });
  }
}

/**
 * Moves a contact between 5-15-50 circles (or out of them entirely) and re-derives their
 * schedule. This is what the board's drag-and-drop calls.
 */
export async function setContactTier(
  db: Database,
  contactId: string,
  tier: Tier | null
): Promise<void> {
  await db.write(async () => {
    const contact = await findContact(db, contactId);
    if (!contact) return;

    // Read before the update: the anchor is the last outreach, which the tier change
    // does not touch.
    const anchor = outreachAnchor(contact);

    await contact.update((row: Contact) => {
      row.tier = tier ?? undefined;
    });

    await scheduleNextOutreach(db, contactId, anchor);

    await upsertMeta(db, 'contact', contactId);
    await enqueueOutbox(db, 'contact', 'update', { id: contactId, tier });
  });
}

/**
 * Repairs gaps in the generated schedule: a tiered contact without exactly one open
 * reminder gets a fresh one, and a contact who has left the 5-15-50 loses theirs.
 *
 * Only touches contacts whose state is wrong, so a date the user nudged by hand survives
 * every launch. Run once when the app mounts — it is the safety net for a schedule that
 * would otherwise be broken by a crash mid-write or a row deleted while untiered.
 */
export async function repairOutreachReminders(db: Database) {
  const contacts = await db.get<Contact>('contacts').query().fetch();

  await db.write(async () => {
    for (const contact of contacts) {
      const tier = toTier(contact.tier);
      const { open } = await autoReminders(db, contact.id);
      const broken = tier ? open.length !== 1 : open.length > 0;
      if (!broken) continue;

      await scheduleNextOutreach(db, contact.id, outreachAnchor(contact));
    }
  });
}

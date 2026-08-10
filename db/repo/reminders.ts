import type { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import { from, map, of, switchMap } from 'rxjs';
import type {
  ReminderOrigin,
  Reminder as ReminderType,
  ReminderInput,
  ReminderSummary,
} from '../../app/types/reminders';
import Contact from '../models/Contact';
import Reminder from '../models/Reminder';
import { markDeletedMeta, upsertMeta } from './metadata';
import { enqueueOutbox } from './outbox';
import { recordOutreach, scheduleNextOutreach } from './outreach';

function toDTO(row: Reminder): ReminderType {
  return {
    id: row.id,
    contactId: row.contactId || undefined,
    title: row.title,
    date: row.dateTs ? new Date(row.dateTs) : undefined,
    completed: row.completed ?? false,
    // Rows predating the origin column, and every hand-written one, are manual.
    origin: row.origin === 'auto' ? 'auto' : ('manual' as ReminderOrigin),
  };
}

/**
 * Attaches contact names to reminders in one extra query (rather than one per row) so
 * the calendar and agenda can label a reminder without touching the contacts table.
 */
async function toSummaries(db: Database, rows: Reminder[]): Promise<ReminderSummary[]> {
  const contactIds = [...new Set(rows.map(r => r.contactId).filter(Boolean))] as string[];

  const contacts = contactIds.length
    ? await db
        .get<Contact>('contacts')
        .query(Q.where('id', Q.oneOf(contactIds)))
        .fetch()
    : [];
  const byId = new Map(contacts.map(c => [c.id, c]));

  return rows.map(row => {
    const contact = row.contactId ? byId.get(row.contactId) : undefined;
    return {
      ...toDTO(row),
      contactFirstName: contact?.firstName || undefined,
      contactLastName: contact?.lastName || undefined,
    };
  });
}

/** All reminders, soonest first, with undated ones last. Reactive. */
export function observeReminderSummaries(db: Database) {
  return db
    .get<Reminder>('reminders')
    .query()
    .observeWithColumns(['title', 'date_ts', 'completed', 'contact_id'])
    .pipe(
      switchMap(rows =>
        rows.length ? from(toSummaries(db, rows)) : of([] as ReminderSummary[])
      ),
      // Undated reminders sort to the top of the agenda; the rest go by date.
      map(summaries =>
        [...summaries].sort((a, b) => {
          if (!a.date && !b.date) return a.title.localeCompare(b.title);
          if (!a.date) return -1;
          if (!b.date) return 1;
          return a.date.getTime() - b.date.getTime();
        })
      )
    );
}

/** Reminders for a single contact, used by the contact detail screen. Reactive. */
export function observeContactReminders(db: Database, contactId: string) {
  return db
    .get<Reminder>('reminders')
    .query(Q.where('contact_id', contactId), Q.sortBy('date_ts', Q.asc))
    .observeWithColumns(['title', 'date_ts', 'completed'])
    .pipe(map(rows => rows.map(toDTO)));
}

export async function readReminder(
  db: Database,
  id: string
): Promise<ReminderType | null> {
  const rows = await db.get<Reminder>('reminders').query(Q.where('id', id)).fetch();
  return rows[0] ? toDTO(rows[0]) : null;
}

export async function createReminder(db: Database, input: ReminderInput) {
  let created!: Reminder;

  await db.write(async () => {
    created = await db.get<Reminder>('reminders').create((r: Reminder) => {
      r.title = input.title;
      r.dateTs = input.date?.getTime();
      r.contactId = input.contactId;
      r.completed = input.completed ?? false;
      r.origin = input.origin ?? 'manual';
    });

    await upsertMeta(db, 'reminder', created.id);
    await enqueueOutbox(db, 'reminder', 'create', toDTO(created));
  });

  return toDTO(created);
}

export async function updateReminder(
  db: Database,
  id: string,
  changes: Partial<Omit<ReminderType, 'id'>>
) {
  await db.write(async () => {
    const reminder = await db.get<Reminder>('reminders').find(id);
    const wasCompleted = !!reminder.completed;
    const isAuto = reminder.origin === 'auto';
    const contactId = reminder.contactId;

    await reminder.update((r: Reminder) => {
      if (changes.title !== undefined) r.title = changes.title;
      if (changes.date !== undefined) r.dateTs = changes.date?.getTime();
      if (changes.contactId !== undefined) r.contactId = changes.contactId;
      if (changes.completed !== undefined) r.completed = changes.completed;
    });

    await upsertMeta(db, 'reminder', id);
    await enqueueOutbox(db, 'reminder', 'update', { id, ...changes });

    // Ticking off a generated reminder is the signal that the user actually reached out:
    // it resets the 5-15-50 clock and queues the next touch. `wasCompleted` keeps a
    // re-toggle from advancing the schedule twice.
    if (isAuto && contactId && changes.completed === true && !wasCompleted) {
      await recordOutreach(db, contactId, new Date());
    }
  });
}

export async function deleteReminder(db: Database, id: string) {
  await db.write(async () => {
    const rows = await db.get<Reminder>('reminders').query(Q.where('id', id)).fetch();
    const row = rows[0];
    const isAuto = row?.origin === 'auto';
    const contactId = row?.contactId;

    if (row) await row.destroyPermanently();

    await markDeletedMeta(db, 'reminder', id);
    await enqueueOutbox(db, 'reminder', 'delete', { id });

    // A generated reminder can't simply be deleted while the contact is still in a
    // circle — a cadence with no next touch isn't a cadence. Deleting one therefore means
    // "skip this touch", and the next is scheduled a full cadence from today. Dropping
    // the contact from the 5-15-50 on the board is how you stop the nudges for good.
    if (isAuto && contactId) {
      await scheduleNextOutreach(db, contactId, new Date());
    }
  });
}

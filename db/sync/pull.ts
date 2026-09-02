import type {
  RemoteAddress,
  RemoteContact,
  RemoteEmail,
  RemotePhone,
  RemoteReminder,
} from './mapping';
import {
  applyRemoteContact,
  applyRemoteContactDeletion,
  applyRemoteReminder,
  applyRemoteReminderDeletion,
} from './applyRemote';
import { fromRemoteContact, fromRemoteReminder } from './mapping';
import { readCursor, writeCursor } from './cursor';

import type { Database } from '@nozbe/watermelondb';
import { readOutboxQueue } from '../repo/outbox';
import { supabase } from '../../lib/supabase';

/** Rows per request. A full page means there is more to fetch, so the loop continues. */
const PAGE = 500;

/**
 * Ids with a queued local change. A pulled row for one of these is skipped: the local
 * edit has not reached the server yet, so applying the server's older copy would silently
 * throw away what the user just did. Push runs before pull in each cycle, which narrows
 * this to the rare case of a push that failed partway.
 */
async function pendingIds(db: Database): Promise<Set<string>> {
  const rows = await readOutboxQueue(db, 1000);
  const ids = new Set<string>();
  for (const row of rows) {
    try {
      const id = (JSON.parse(row.payloadJson) as { id?: string }).id;
      if (id) ids.add(id);
    } catch {
      // Unreadable payloads are dropped by the push pass; nothing to protect here.
    }
  }
  return ids;
}

const newestOf = (rows: { updated_at: string }[]) =>
  rows.map(r => r.updated_at).sort().at(-1);

/**
 * Contacts, oldest change first.
 *
 * The child tables carry no `updated_at` of their own — a trigger bumps the parent
 * contact whenever a child changes (SUPABASE_BACKEND.md §2.2). So a contact appearing in
 * a page is the signal to refetch its complete child set and reconcile against it.
 */
async function pullContacts(
  db: Database,
  userId: string,
  skip: Set<string>
): Promise<number> {
  let cursor = await readCursor(userId, 'contacts');
  let applied = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .gt('updated_at', cursor)
      .order('updated_at', { ascending: true })
      .limit(PAGE)
      .returns<RemoteContact[]>();
    if (error) throw error;

    const rows = data ?? [];
    if (!rows.length) break;

    // Children only for the live contacts — a tombstoned one is about to be deleted
    // locally, children and all.
    const liveIds = rows.filter(row => !row.deleted_at).map(row => row.id);

    const [emails, phones, addresses] = liveIds.length
      ? await Promise.all([
          supabase
            .from('emails')
            .select('*')
            .in('contact_id', liveIds)
            .returns<RemoteEmail[]>(),
          supabase
            .from('phone_numbers')
            .select('*')
            .in('contact_id', liveIds)
            .returns<RemotePhone[]>(),
          supabase
            .from('addresses')
            .select('*')
            .in('contact_id', liveIds)
            .returns<RemoteAddress[]>(),
        ])
      : [
          { data: [] as RemoteEmail[], error: null },
          { data: [] as RemotePhone[], error: null },
          { data: [] as RemoteAddress[], error: null },
        ];

    for (const result of [emails, phones, addresses]) {
      if (result.error) throw result.error;
    }

    const groupByContact = <T extends { contact_id: string }>(list: T[]) => {
      const map = new Map<string, T[]>();
      for (const row of list) {
        const bucket = map.get(row.contact_id);
        if (bucket) bucket.push(row);
        else map.set(row.contact_id, [row]);
      }
      return map;
    };

    const emailsBy = groupByContact(emails.data ?? []);
    const phonesBy = groupByContact(phones.data ?? []);
    const addressesBy = groupByContact(addresses.data ?? []);

    // One transaction per page: a page either lands whole or not at all.
    await db.write(async () => {
      for (const row of rows) {
        if (skip.has(row.id)) continue;
        const stamp = new Date(row.updated_at).getTime();

        if (row.deleted_at) {
          await applyRemoteContactDeletion(db, row.id, stamp);
        } else {
          await applyRemoteContact(
            db,
            fromRemoteContact(
              row,
              emailsBy.get(row.id) ?? [],
              phonesBy.get(row.id) ?? [],
              addressesBy.get(row.id) ?? []
            ),
            stamp
          );
        }
        applied += 1;
      }
    });

    // Persist per page, so an interrupted multi-page pull resumes where it stopped.
    const newest = newestOf(rows);
    if (!newest || newest === cursor) break;
    cursor = newest;
    await writeCursor(userId, 'contacts', cursor);

    if (rows.length < PAGE) break;
  }

  return applied;
}

async function pullReminders(
  db: Database,
  userId: string,
  skip: Set<string>
): Promise<number> {
  let cursor = await readCursor(userId, 'reminders');
  let applied = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .gt('updated_at', cursor)
      .order('updated_at', { ascending: true })
      .limit(PAGE)
      .returns<RemoteReminder[]>();
    if (error) throw error;

    const rows = data ?? [];
    if (!rows.length) break;

    await db.write(async () => {
      for (const row of rows) {
        if (skip.has(row.id)) continue;
        const stamp = new Date(row.updated_at).getTime();

        if (row.deleted_at) {
          await applyRemoteReminderDeletion(db, row.id, stamp);
        } else {
          await applyRemoteReminder(db, fromRemoteReminder(row), stamp);
        }
        applied += 1;
      }
    });

    const newest = newestOf(rows);
    if (!newest || newest === cursor) break;
    cursor = newest;
    await writeCursor(userId, 'reminders', cursor);

    if (rows.length < PAGE) break;
  }

  return applied;
}

/** Applies everything on the server newer than this device's cursors. */
export async function pullChanges(db: Database, userId: string): Promise<number> {
  const skip = await pendingIds(db);

  // Contacts first: a reminder references a contact, so pulling the parent first avoids a
  // window where a reminder points at a contact this device has not created yet.
  const contacts = await pullContacts(db, userId, skip);
  const reminders = await pullReminders(db, userId, skip);

  return contacts + reminders;
}

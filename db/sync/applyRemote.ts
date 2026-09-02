import type { Address as AddressType, Contact as ContactType, Email as EmailType, Phone as PhoneType } from '../../app/types/contacts';
import { applyAddress, applyEmail, applyPhone, syncChildren } from '../repo/contacts';
import { markDeletedMeta, upsertMeta } from '../repo/metadata';

import Address from '../models/Address';
import Contact from '../models/Contact';
import type { Database } from '@nozbe/watermelondb';
import Email from '../models/Email';
import PhoneNumber from '../models/PhoneNumber';
import { Q } from '@nozbe/watermelondb';
import Reminder from '../models/Reminder';
import type { Reminder as ReminderType } from '../../app/types/reminders';

/**
 * Writes pulled rows into WatermelonDB.
 *
 * This module exists because pulled changes must NOT go through `createContact` /
 * `updateContact` / `createReminder` / `updateReminder`, for two reasons that both fail
 * silently:
 *
 *  1. **Echo loop.** Those functions call `enqueueOutbox`, so every row we pull would
 *     immediately queue itself for push, and keep doing so forever.
 *  2. **Cadence corruption.** `updateContact` and `updateReminder` funnel through
 *     `scheduleNextOutreach` / `recordOutreach` (CLAUDE.md §14). Applying a pull through
 *     them would re-derive the 5-15-50 schedule and move reminder dates the user never
 *     touched.
 *
 * So everything here writes fields directly, maintains `metadata` itself, and touches the
 * outbox never.
 */

/** Assigns the DTO's scalar fields onto a contact row. */
function applyContactFields(row: Contact, dto: ContactType) {
  row.firstName = dto.firstName;
  row.lastName = dto.lastName;
  row.company = dto.company;
  row.jobTitle = dto.jobTitle;
  row.alumni = dto.alumni;
  row.tier = dto.tier ?? undefined;
  row.lastOutreachAt = dto.lastOutreachAt?.getTime();
  row.source = dto.source;
  row.notes = dto.notes;
  row.firstMetDate = dto.firstMeeting?.date?.getTime();
  row.firstMetLocation = dto.firstMeeting?.location;
}

function applyReminderFields(row: Reminder, dto: ReminderType) {
  row.title = dto.title;
  row.dateTs = dto.date?.getTime();
  row.contactId = dto.contactId;
  row.completed = dto.completed;
  row.origin = dto.origin;
}

/**
 * Upserts one pulled contact and reconciles its children against the server's set.
 * Must run inside a `db.write(...)`.
 */
export async function applyRemoteContact(
  db: Database,
  dto: ContactType,
  serverUpdatedAt: number
) {
  const existing = await db
    .get<Contact>('contacts')
    .query(Q.where('id', dto.id))
    .fetch();

  if (existing[0]) {
    await existing[0].update(row => applyContactFields(row, dto));
  } else {
    await db.get<Contact>('contacts').create(row => {
      // The server's id is the record's identity across devices — never let WatermelonDB
      // mint a new one here.
      row._raw.id = dto.id;
      applyContactFields(row, dto);
    });
  }

  // `preserveIds` for the same reason: these are the server's child ids.
  await syncChildren<Email, EmailType>(db, 'emails', dto.id, dto.emails, applyEmail, {
    preserveIds: true,
  });
  await syncChildren<PhoneNumber, PhoneType>(
    db,
    'phoneNumbers',
    dto.id,
    dto.phones,
    applyPhone,
    { preserveIds: true }
  );
  await syncChildren<Address, AddressType>(
    db,
    'addresses',
    dto.id,
    dto.addresses,
    applyAddress,
    { preserveIds: true }
  );

  await upsertMeta(db, 'contact', dto.id, serverUpdatedAt);
}

/** Applies a contact tombstone: the local cascade delete, without an outbox entry. */
export async function applyRemoteContactDeletion(
  db: Database,
  id: string,
  serverUpdatedAt: number
) {
  const [emailRows, phoneRows, addrRows, reminderRows, contactRows] = await Promise.all([
    db.get<Email>('emails').query(Q.where('contact_id', id)).fetch(),
    db.get<PhoneNumber>('phoneNumbers').query(Q.where('contact_id', id)).fetch(),
    db.get<Address>('addresses').query(Q.where('contact_id', id)).fetch(),
    db.get<Reminder>('reminders').query(Q.where('contact_id', id)).fetch(),
    db.get<Contact>('contacts').query(Q.where('id', id)).fetch(),
  ]);

  await Promise.all(
    [...emailRows, ...phoneRows, ...addrRows, ...reminderRows].map(row =>
      row.destroyPermanently()
    )
  );
  if (contactRows[0]) await contactRows[0].destroyPermanently();

  await markDeletedMeta(db, 'contact', id, serverUpdatedAt);
}

export async function applyRemoteReminder(
  db: Database,
  dto: ReminderType,
  serverUpdatedAt: number
) {
  const existing = await db
    .get<Reminder>('reminders')
    .query(Q.where('id', dto.id))
    .fetch();

  if (existing[0]) {
    await existing[0].update(row => applyReminderFields(row, dto));
  } else {
    await db.get<Reminder>('reminders').create(row => {
      row._raw.id = dto.id;
      applyReminderFields(row, dto);
    });
  }

  await upsertMeta(db, 'reminder', dto.id, serverUpdatedAt);
}

export async function applyRemoteReminderDeletion(
  db: Database,
  id: string,
  serverUpdatedAt: number
) {
  const rows = await db.get<Reminder>('reminders').query(Q.where('id', id)).fetch();
  if (rows[0]) await rows[0].destroyPermanently();
  await markDeletedMeta(db, 'reminder', id, serverUpdatedAt);
}

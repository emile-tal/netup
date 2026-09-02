import type { Database, Model } from '@nozbe/watermelondb';
import type { Observable } from 'rxjs';
import { Q } from '@nozbe/watermelondb';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  Address as AddressType,
  Contact as ContactType,
  ContactSummary,
  Email as EmailType,
  Phone as PhoneType,
} from '../../app/types/contacts';
import { toTier } from '../../app/utils/outreach';
import Address from '../models/Address';
import Contact from '../models/Contact';
import Email from '../models/Email';
import PhoneNumber from '../models/PhoneNumber';
import Reminder from '../models/Reminder';
import { markDeletedMeta, upsertMeta } from './metadata';
import { enqueueOutbox } from './outbox';
import {
  outreachAnchor,
  refreshOutreachTitles,
  scheduleNextOutreach,
} from './outreach';

/** The columns a summary is built from — what the observable has to watch to stay fresh. */
const SUMMARY_COLUMNS = [
  'firstName',
  'lastName',
  'jobTitle',
  'company',
  'tier',
  'lastOutreachAt',
];

export function observeContactSummaries(
  db: Database,
  search?: string
): Observable<ContactSummary[]> {
  const q = (search ?? '').trim();
  // Escapes % and _ so a literal search for them doesn't act as a wildcard.
  const like = `%${Q.sanitizeLikeString(q)}%`;

  const query = q
    ? db
        .get<Contact>('contacts')
        .query(
          Q.or(Q.where('firstName', Q.like(like)), Q.where('lastName', Q.like(like))),
          Q.sortBy('lastName', Q.asc),
          Q.sortBy('firstName', Q.asc)
        )
    : db
        .get<Contact>('contacts')
        .query(Q.sortBy('lastName', Q.asc), Q.sortBy('firstName', Q.asc));

  // `observeWithColumns`, not `observe`: plain `observe` only re-emits when the *set* of
  // matching rows changes, so a rename or a tier move would not reach the list or board.
  return query.observeWithColumns(SUMMARY_COLUMNS).pipe(
    map(rows =>
      rows.map(c => ({
        id: c.id,
        firstName: c.firstName ?? '',
        lastName: c.lastName ?? '',
        jobTitle: c.jobTitle ?? '',
        company: c.company ?? '',
        tier: toTier(c.tier),
        lastOutreachAt: c.lastOutreachAt ? new Date(c.lastOutreachAt) : undefined,
      }))
    )
  );
}

/** Every column `toContactDTO` reads — what an observable has to watch to stay fresh. */
const CONTACT_COLUMNS = [
  'firstName',
  'lastName',
  'company',
  'jobTitle',
  'alumni',
  'tier',
  'lastOutreachAt',
  'source',
  'notes',
  'firstMetDate',
  'firstMetLocation',
];

/**
 * Model rows → the `Contact` DTO. The one place the mapping lives, so the one-shot read
 * and the reactive observable below cannot drift apart.
 */
function toContactDTO(
  contact: Contact,
  emailRows: Email[],
  phoneRows: PhoneNumber[],
  addrRows: Address[]
): ContactType {
  return {
    id: contact.id,
    firstName: contact.firstName ?? '',
    lastName: contact.lastName ?? '',
    company: contact.company ?? '',
    jobTitle: contact.jobTitle ?? '',
    alumni: contact.alumni ?? '',
    tier: toTier(contact.tier),
    lastOutreachAt: contact.lastOutreachAt
      ? new Date(contact.lastOutreachAt)
      : undefined,
    source: contact.source ?? '',
    notes: contact.notes ?? '',

    emails: emailRows.map(e => ({
      id: e.id,
      label: e.label,
      email: e.email,
    })),

    phones: phoneRows.map(p => ({
      id: p.id,
      label: p.label,
      areaCode: p.areaCode,
      phoneNumber: p.phoneNumber,
    })),

    addresses: addrRows.map(a => ({
      id: a.id,
      label: a.label,
      street: a.street,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: a.country,
    })),

    firstMeeting: {
      id: contact.id,
      date: contact.firstMetDate ? new Date(contact.firstMetDate) : undefined,
      location: contact.firstMetLocation ?? '',
    },
  };
}

export async function readContact(db: Database, id: string): Promise<ContactType | null> {
  // Queried rather than `.find(id)` so a missing row returns null without a catch-all
  // that would also swallow real DB errors.
  const contacts = await db.get<Contact>('contacts').query(Q.where('id', id)).fetch();
  const contact = contacts[0];
  if (!contact) return null;

  const [emailRows, phoneRows, addrRows] = await Promise.all([
    db.get<Email>('emails').query(Q.where('contact_id', id)).fetch(),
    db.get<PhoneNumber>('phoneNumbers').query(Q.where('contact_id', id)).fetch(),
    db.get<Address>('addresses').query(Q.where('contact_id', id)).fetch(),
  ]);

  return toContactDTO(contact, emailRows, phoneRows, addrRows);
}

/**
 * One contact and its children, reactive. The detail and edit screens use this so a
 * change arriving from anywhere — another screen, or a sync pull — reaches them without
 * a manual reload. Emits `null` when the contact does not exist (or was deleted).
 */
export function observeContact(
  db: Database,
  id: string
): Observable<ContactType | null> {
  return combineLatest([
    db
      .get<Contact>('contacts')
      .query(Q.where('id', id))
      .observeWithColumns(CONTACT_COLUMNS),
    db
      .get<Email>('emails')
      .query(Q.where('contact_id', id))
      .observeWithColumns(['label', 'email']),
    db
      .get<PhoneNumber>('phoneNumbers')
      .query(Q.where('contact_id', id))
      .observeWithColumns(['label', 'areaCode', 'phoneNumber']),
    db
      .get<Address>('addresses')
      .query(Q.where('contact_id', id))
      .observeWithColumns(['label', 'street', 'city', 'state', 'zip', 'country']),
  ]).pipe(
    map(([contacts, emailRows, phoneRows, addrRows]) =>
      contacts[0] ? toContactDTO(contacts[0], emailRows, phoneRows, addrRows) : null
    )
  );
}

export function applyEmail(row: Email, input: EmailType, contactId: string) {
  row.contactId = contactId;
  row.label = input.label;
  row.email = input.email;
}

export function applyPhone(row: PhoneNumber, input: PhoneType, contactId: string) {
  row.contactId = contactId;
  row.label = input.label;
  row.areaCode = input.areaCode;
  row.phoneNumber = input.phoneNumber;
}

export function applyAddress(row: Address, input: AddressType, contactId: string) {
  row.contactId = contactId;
  row.label = input.label;
  row.street = input.street;
  row.city = input.city;
  row.state = input.state;
  row.zip = input.zip;
  row.country = input.country;
}

/**
 * Reconciles one child collection against what is currently in the DB: rows whose id is
 * gone from `inputs` are destroyed, matching ids are updated, and inputs carrying an
 * unknown id (a row the edit store created locally) are inserted with a fresh DB id.
 * Must run inside a `db.write(...)`.
 *
 * Exported because the sync layer reconciles the same collections when applying a pulled
 * contact — see `db/sync/applyRemote.ts`. Do not write a second copy.
 *
 * `preserveIds` is what the sync layer needs and local edits must not use. Locally, an
 * unknown id means "the edit store invented this one", so letting WatermelonDB assign a
 * real id is right. For a pulled row the id *is* the server's primary key, and inventing
 * a new one would fork the record into two on the next push.
 */
export async function syncChildren<TModel extends Model, TInput extends { id: string }>(
  db: Database,
  table: string,
  contactId: string,
  inputs: TInput[],
  apply: (row: TModel, input: TInput, contactId: string) => void,
  options?: { preserveIds?: boolean }
) {
  const existing = await db
    .get<TModel>(table)
    .query(Q.where('contact_id', contactId))
    .fetch();
  const existingById = new Map(existing.map(row => [row.id, row]));
  const keptIds = new Set(inputs.map(input => input.id));

  const ops: Promise<unknown>[] = [];

  for (const row of existing) {
    if (!keptIds.has(row.id)) ops.push(row.destroyPermanently());
  }

  for (const input of inputs) {
    const row = existingById.get(input.id);
    if (row) {
      ops.push(row.update((r: TModel) => apply(r, input, contactId)));
    } else {
      ops.push(
        db.get<TModel>(table).create((r: TModel) => {
          if (options?.preserveIds) r._raw.id = input.id;
          apply(r, input, contactId);
        })
      );
    }
  }

  await Promise.all(ops);
}

/** Returns the new contact's id. Deliberately not the model — DTOs and ids cross this
 * boundary, WatermelonDB instances do not. */
export async function createContact(
  db: Database,
  input: ContactType
): Promise<string> {
  let newContact!: Contact;

  await db.write(async () => {
    newContact = await db.get<Contact>('contacts').create((c: Contact) => {
      c.firstName = input.firstName;
      c.lastName = input.lastName;
      c.company = input.company;
      c.jobTitle = input.jobTitle;
      c.alumni = input.alumni;
      c.tier = input.tier ?? undefined;
      c.lastOutreachAt = input.lastOutreachAt?.getTime();
      c.source = input.source;
      c.notes = input.notes;
      c.firstMetDate = input.firstMeeting?.date?.getTime();
      c.firstMetLocation = input.firstMeeting?.location;
    });

    const ops: Promise<unknown>[] = [
      ...input.emails.map(email =>
        db.get<Email>('emails').create((e: Email) => applyEmail(e, email, newContact.id))
      ),
      ...input.phones.map(phone =>
        db
          .get<PhoneNumber>('phoneNumbers')
          .create((p: PhoneNumber) => applyPhone(p, phone, newContact.id))
      ),
      ...input.addresses.map(address =>
        db
          .get<Address>('addresses')
          .create((a: Address) => applyAddress(a, address, newContact.id))
      ),
    ];

    await Promise.all(ops);

    // A contact created straight into a circle gets their first touch scheduled here, so
    // the cadence starts the moment they exist rather than on the next board interaction.
    if (input.tier) {
      await scheduleNextOutreach(db, newContact.id, outreachAnchor(newContact));
    }

    await upsertMeta(db, 'contact', newContact.id);
    await enqueueOutbox(db, 'contact', 'create', { ...input, id: newContact.id });
  });

  return newContact.id;
}

/**
 * Updates the contact root scalar fields, the folded firstMeeting, and — when the
 * corresponding array is present on `changes` — reconciles the child collections.
 * Omitting an array leaves that collection untouched.
 */
export async function updateContact(
  db: Database,
  id: string,
  changes: Partial<ContactType>
) {
  await db.write(async () => {
    const contact = await db.get<Contact>('contacts').find(id);
    // Read before the update, so the tier comparison and the cadence anchor below see the
    // pre-edit state.
    const previousTier = toTier(contact.tier);
    const anchor = outreachAnchor(contact);

    await contact.update((c: Contact) => {
      if (changes.firstName !== undefined) c.firstName = changes.firstName;
      if (changes.lastName !== undefined) c.lastName = changes.lastName;
      if (changes.company !== undefined) c.company = changes.company;
      if (changes.jobTitle !== undefined) c.jobTitle = changes.jobTitle;
      if (changes.alumni !== undefined) c.alumni = changes.alumni;
      if (changes.tier !== undefined) c.tier = changes.tier ?? undefined;
      if (changes.lastOutreachAt !== undefined)
        c.lastOutreachAt = changes.lastOutreachAt?.getTime();
      if (changes.source !== undefined) c.source = changes.source;
      if (changes.notes !== undefined) c.notes = changes.notes;
      if (changes.firstMeeting !== undefined) {
        c.firstMetDate = changes.firstMeeting.date?.getTime();
        c.firstMetLocation = changes.firstMeeting.location;
      }
    });

    if (changes.emails) {
      await syncChildren<Email, EmailType>(db, 'emails', id, changes.emails, applyEmail);
    }
    if (changes.phones) {
      await syncChildren<PhoneNumber, PhoneType>(
        db,
        'phoneNumbers',
        id,
        changes.phones,
        applyPhone
      );
    }
    if (changes.addresses) {
      await syncChildren<Address, AddressType>(
        db,
        'addresses',
        id,
        changes.addresses,
        applyAddress
      );
    }

    // Only a tier *change* re-derives the schedule — saving the edit form without
    // touching the circle must not move a date the user nudged by hand.
    if (changes.tier !== undefined && changes.tier !== previousTier) {
      await scheduleNextOutreach(db, id, anchor);
    } else if (changes.firstName !== undefined || changes.lastName !== undefined) {
      await refreshOutreachTitles(db, id);
    }

    await upsertMeta(db, 'contact', id);
    await enqueueOutbox(db, 'contact', 'update', { ...changes, id });
  });
}

export async function deleteContact(db: Database, id: string) {
  await db.write(async () => {
    const [emailRows, phoneRows, addrRows, reminderRows] = await Promise.all([
      db.get<Email>('emails').query(Q.where('contact_id', id)).fetch(),
      db.get<PhoneNumber>('phoneNumbers').query(Q.where('contact_id', id)).fetch(),
      db.get<Address>('addresses').query(Q.where('contact_id', id)).fetch(),
      db.get<Reminder>('reminders').query(Q.where('contact_id', id)).fetch(),
    ]);

    const children = [...emailRows, ...phoneRows, ...addrRows, ...reminderRows];
    await Promise.all(children.map(row => row.destroyPermanently()));

    const contacts = await db.get<Contact>('contacts').query(Q.where('id', id)).fetch();
    if (contacts[0]) await contacts[0].destroyPermanently();

    await markDeletedMeta(db, 'contact', id);
    await enqueueOutbox(db, 'contact', 'delete', { id });
  });
}

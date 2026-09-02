/**
 * The DTO ⇄ Postgres translation, in one place.
 *
 * Two conventions differ across the wire and have to be reconciled here, not anywhere
 * else: the local schema is mixed-case (`firstName`, but `contact_id`) while Postgres is
 * snake_case throughout, and local dates are epoch-ms / `Date` while Postgres columns are
 * `timestamptz` (ISO strings).
 */

import type { Contact } from '../../app/types/contacts';
import type { Reminder, ReminderOrigin } from '../../app/types/reminders';

import { toTier } from '../../app/utils/outreach';

// ─────────────────────────────────────────────────────────── remote row shapes

export interface RemoteContact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
  alumni: string | null;
  tier: number | null;
  last_outreach_at: string | null;
  source: string | null;
  notes: string | null;
  first_met_date: string | null;
  first_met_location: string | null;
  updated_at: string;
  deleted_at: string | null;
}

export interface RemoteEmail {
  id: string;
  contact_id: string;
  label: string | null;
  email: string | null;
}

export interface RemotePhone {
  id: string;
  contact_id: string;
  label: string | null;
  area_code: string | null;
  phone_number: string | null;
}

export interface RemoteAddress {
  id: string;
  contact_id: string;
  label: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

export interface RemoteReminder {
  id: string;
  contact_id: string | null;
  title: string | null;
  date_ts: string | null;
  completed: boolean | null;
  origin: string | null;
  updated_at: string;
  deleted_at: string | null;
}

// ────────────────────────────────────────────────────────────────── date helpers

/** `Date` → ISO, preserving "absent" as null rather than collapsing it to the epoch. */
export const toIso = (value?: Date | null): string | null =>
  value ? value.toISOString() : null;

/** ISO → `Date`. An unparseable value is treated as absent rather than Invalid Date. */
export function fromIso(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// ─────────────────────────────────────────────────────────────────── outgoing

/**
 * The `p` argument for the `push_contact` RPC: the whole aggregate in one object, which
 * is what lets the server upsert parent and children and drop removed children inside a
 * single transaction.
 */
export function toRemoteContactPayload(contact: Contact): Record<string, unknown> {
  return {
    id: contact.id,
    first_name: contact.firstName,
    last_name: contact.lastName,
    company: contact.company,
    job_title: contact.jobTitle,
    alumni: contact.alumni,
    tier: contact.tier,
    last_outreach_at: toIso(contact.lastOutreachAt),
    source: contact.source,
    notes: contact.notes,
    first_met_date: toIso(contact.firstMeeting?.date),
    first_met_location: contact.firstMeeting?.location ?? null,

    emails: contact.emails.map(e => ({
      id: e.id,
      label: e.label,
      email: e.email,
    })),
    phones: contact.phones.map(p => ({
      id: p.id,
      label: p.label,
      area_code: p.areaCode ?? null,
      phone_number: p.phoneNumber,
    })),
    addresses: contact.addresses.map(a => ({
      id: a.id,
      label: a.label,
      street: a.street ?? null,
      city: a.city ?? null,
      state: a.state ?? null,
      zip: a.zip ?? null,
      country: a.country ?? null,
    })),
  };
}

/** Reminders have no children, so they go up as a plain upsert. */
export function toRemoteReminder(reminder: Reminder, userId: string) {
  return {
    id: reminder.id,
    user_id: userId,
    contact_id: reminder.contactId ?? null,
    title: reminder.title,
    date_ts: toIso(reminder.date),
    completed: reminder.completed,
    origin: reminder.origin,
  };
}

// ─────────────────────────────────────────────────────────────────── incoming

export function fromRemoteContact(
  row: RemoteContact,
  emails: RemoteEmail[],
  phones: RemotePhone[],
  addresses: RemoteAddress[]
): Contact {
  return {
    id: row.id,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    company: row.company ?? '',
    jobTitle: row.job_title ?? '',
    alumni: row.alumni ?? '',
    // Narrowed rather than cast: the column is a smallint and the check constraint is the
    // server's business, so a value we don't recognise reads as unassigned.
    tier: toTier(row.tier ?? undefined),
    lastOutreachAt: fromIso(row.last_outreach_at),
    source: row.source ?? '',
    notes: row.notes ?? '',

    emails: emails.map(e => ({
      id: e.id,
      label: e.label ?? '',
      email: e.email ?? '',
    })),
    phones: phones.map(p => ({
      id: p.id,
      label: p.label ?? '',
      areaCode: p.area_code ?? undefined,
      phoneNumber: p.phone_number ?? '',
    })),
    addresses: addresses.map(a => ({
      id: a.id,
      label: a.label ?? '',
      street: a.street ?? undefined,
      city: a.city ?? undefined,
      state: a.state ?? undefined,
      zip: a.zip ?? undefined,
      country: a.country ?? undefined,
    })),

    firstMeeting: {
      id: row.id,
      date: fromIso(row.first_met_date),
      location: row.first_met_location ?? '',
    },
  };
}

export function fromRemoteReminder(row: RemoteReminder): Reminder {
  return {
    id: row.id,
    contactId: row.contact_id ?? undefined,
    title: row.title ?? '',
    date: fromIso(row.date_ts),
    completed: row.completed ?? false,
    origin: (row.origin === 'auto' ? 'auto' : 'manual') as ReminderOrigin,
  };
}

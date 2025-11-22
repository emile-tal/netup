import type { Database } from '@nozbe/watermelondb';
import { Contact as ContactType } from '../../app/types/contacts';
import Address from '../models/Address';
import Contact from '../models/Contact';
import Email from '../models/Email';
import FirstMeeting from '../models/FirstMeeting';
import PhoneNumber from '../models/PhoneNumber';
// src/db/repo/contactsList.ts
import { Q } from '@nozbe/watermelondb';
import { map } from 'rxjs/operators';

export type ContactSummary = { id: string; firstName: string; lastName: string };

export function observeContactSummaries(db: Database, search?: string) {
  const q = (search ?? '').trim().toLowerCase();

  const query = q
    ? db
        .get<Contact>('contacts')
        .query(
          Q.or(
            Q.where('firstName', Q.like(`%${q}%`)),
            Q.where('lastName', Q.like(`%${q}%`))
          ),
          Q.sortBy('lastName', Q.asc),
          Q.sortBy('firstName', Q.asc)
        )
    : db
        .get<Contact>('contacts')
        .query(Q.sortBy('lastName', Q.asc), Q.sortBy('firstName', Q.asc));

  return query
    .observe()
    .pipe(
      map(rows =>
        rows.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))
      )
    );
}

export async function readContact(db: Database, id: string): Promise<ContactType | null> {
  const contact = await db
    .get<Contact>('contacts')
    .find(id)
    .catch(() => null);
  if (!contact) return null;

  const [emailRows, phoneRows, addrRows, fmRows] = await Promise.all([
    db.get<Email>('emails').query(Q.where('contact_id', id)).fetch(),
    db.get<PhoneNumber>('phoneNumbers').query(Q.where('contact_id', id)).fetch(),
    db.get<Address>('addresses').query(Q.where('contact_id', id)).fetch(),
    db.get<FirstMeeting>('firstMeetings').query(Q.where('contact_id', id)).fetch(),
  ]);

  return {
    id: contact.id,
    firstName: contact.firstName ?? '',
    lastName: contact.lastName ?? '',
    company: contact.company ?? '',
    jobTitle: contact.jobTitle ?? '',
    alumni: contact.alumni ?? '',
    relationshipStrength: contact.relationshipStrength,
    outreachGoal: contact.outreachGoal,
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
      id: fmRows[0].id,
      date: fmRows[0].date ? new Date(fmRows[0].date) : undefined,
      location: fmRows[0].location,
    },
  };
}

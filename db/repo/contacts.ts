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
import { upsertMeta } from './metadata';

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
      id: fmRows[0]?.id ?? '',
      date: fmRows[0]?.date ? new Date(fmRows[0].date) : undefined,
      location: fmRows[0]?.location ?? '',
    },
  };
}

export async function createContact(db: Database, input: ContactType) {
  let newContact!: Contact;

  await db.write(async () => {
    newContact = await db.get<Contact>('contacts').create((c: Contact) => {
      c.firstName = input.firstName;
      c.lastName = input.lastName;
      c.company = input.company;
      c.jobTitle = input.jobTitle;
      c.alumni = input.alumni;
      c.relationshipStrength = input.relationshipStrength;
      c.outreachGoal = input.outreachGoal;
      c.source = input.source;
      c.notes = input.notes;
    });

    const ops: Promise<any>[] = [];

    ops.push(
      ...input.emails.map(email =>
        db.get<Email>('emails').create((e: Email) => {
          e.contactId = newContact.id;
          e.label = email.label;
          e.email = email.email;
        })
      ),
      ...input.phones.map(phone =>
        db.get<PhoneNumber>('phoneNumbers').create((p: PhoneNumber) => {
          p.contactId = newContact.id;
          p.label = phone.label;
          p.areaCode = phone.areaCode;
          p.phoneNumber = phone.phoneNumber;
        })
      ),
      ...input.addresses.map(address =>
        db.get<Address>('addresses').create((a: Address) => {
          a.contactId = newContact.id;
          a.label = address.label;
          a.street = address.street;
          a.city = address.city;
          a.state = address.state;
          a.zip = address.zip;
          a.country = address.country;
        })
      )
    );

    if (input.firstMeeting) {
      ops.push(
        db.get<FirstMeeting>('firstMeetings').create((fm: FirstMeeting) => {
          fm.contactId = newContact.id;
          fm.date = input.firstMeeting.date?.toISOString();
          fm.location = input.firstMeeting.location;
        })
      );
    }

    await Promise.all(ops);
    await upsertMeta(db, 'contact', newContact.id);
  });

  return newContact;
}

import { contactsData } from '@/app/placeholderData';
import { Database } from '@nozbe/watermelondb';
import Contact from './models/Contact';
import { createContact } from './repo/contacts';
import { createReminder } from './repo/reminders';

const seedContacts = async (db: Database) => {
  // Sequential so the ids come back in a predictable order for the reminder seed below.
  const created: Contact[] = [];
  for (const contact of contactsData) {
    created.push(await createContact(db, contact));
  }
  return created;
};

/**
 * The outreach reminders are *not* seeded here — `createContact` generates one per tiered
 * contact from their 5-15-50 cadence. These are the hand-written kind, so a fresh dev DB
 * exercises both origins side by side.
 *
 * Dated relative to today (rather than fixed in placeholderData) so they always land on
 * the visible calendar month.
 */
const seedReminders = async (db: Database, contacts: Contact[]) => {
  const today = new Date();
  const manual: { title: string; offset: number }[] = [
    { title: 'Send the deck over', offset: -3 },
    { title: 'Intro call', offset: 0 },
    { title: 'Coffee', offset: 2 },
    { title: 'Follow up on the referral', offset: 9 },
  ];

  for (const [index, { title, offset }] of manual.entries()) {
    const contact = contacts[index % contacts.length];
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);

    await createReminder(db, { title, date, contactId: contact.id });
  }

  await createReminder(db, { title: 'Undated reminder' });
};

export async function resetAndSeed(db: Database) {
  try {
    // Must be inside a writer, or WatermelonDB throws and the seed below appends to the
    // existing rows instead of replacing them.
    await db.write(async () => {
      await db.unsafeResetDatabase();
    });
  } catch (error) {
    console.error('Error resetting database');
    console.error(error);
  }
  try {
    const contacts = await seedContacts(db);
    await seedReminders(db, contacts);
  } catch (error) {
    console.error('Error seeding data');
    console.error(error);
  }
}

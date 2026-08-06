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
 * Reminders are generated relative to today (rather than kept as fixed dates in
 * placeholderData) so a freshly seeded dev DB always has something on the visible
 * calendar month.
 */
const seedReminders = async (db: Database, contacts: Contact[]) => {
  const today = new Date();
  const offsets = [-14, -3, 0, 1, 2, 5, 9, 21];

  for (const [index, offset] of offsets.entries()) {
    const contact = contacts[index % contacts.length];
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);

    await createReminder(db, {
      title: `Reach out to ${contact.firstName ?? 'contact'}`,
      date,
      contactId: contact.id,
    });
  }

  await createReminder(db, { title: 'Undated reminder' });
};

export async function resetAndSeed(db: Database) {
  try {
    await db.unsafeResetDatabase();
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

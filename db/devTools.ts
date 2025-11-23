import { contactsData } from '@/app/placeholderData';
import { Database } from '@nozbe/watermelondb';
import { createContact } from './repo/contacts';

const seedContacts = async (db: Database) => {
  await Promise.all(
    contactsData.map(async contact => {
      await createContact(db, contact);
    })
  );
};

export async function resetAndSeed(db: Database) {
  try {
    await db.unsafeResetDatabase();
  } catch (error) {
    console.error('Error resetting database');
    console.error(error);
  }
  try {
    await seedContacts(db);
  } catch (error) {
    console.error('Error seeding contacts');
    console.error(error);
  }
}

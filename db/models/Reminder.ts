import { field, relation, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';
import Contact from './Contact';

export default class Reminder extends Model {
  static table = 'reminders' as const;
  static associations = {
    contact: { type: 'belongs_to', key: 'contact_id' },
  } as const;

  @text('title') title!: string;
  // Optional to match the schema: an undated reminder is a plain to-do.
  @field('date_ts') dateTs?: number;
  // Optional to match the schema: a reminder need not belong to a contact.
  @text('contact_id') contactId?: string;
  @field('completed') completed?: boolean;

  @relation('contacts', 'contact_id') contact!: Contact;
}

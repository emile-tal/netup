import { field, relation, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';
import Contact from './Contact';

export default class Reminder extends Model {
  static table = 'reminders' as const;
  static associations = {
    contact: { type: 'belongs_to', key: 'contact_id' },
  } as const;

  @text('title') title!: string;
  @field('date_ts') dateTs!: number;
  @text('contact_id') contactId!: string;

  @relation('contacts', 'contact_id') contact!: Contact;
}

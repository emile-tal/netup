import { relation, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';
import Contact from './Contact';

export default class Email extends Model {
  static table = 'emails' as const;
  static associations = {
    contact: { type: 'belongs_to', key: 'contact_id' },
  } as const;

  @text('label') label!: string;
  @text('email') email!: string;
  @text('contact_id') contactId!: string;

  @relation('contacts', 'contact_id') contact!: Contact;
}

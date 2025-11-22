import { relation, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';
import Contact from './Contact';

export default class Address extends Model {
  static table = 'addresses' as const;
  static associations = {
    contact: { type: 'belongs_to', key: 'contact_id' },
  } as const;

  @text('label') label!: string;
  @text('street') street?: string;
  @text('city') city?: string;
  @text('state') state?: string;
  @text('zip') zip?: string;
  @text('country') country?: string;
  @text('contact_id') contactId!: string;

  @relation('contacts', 'contact_id') contact!: Contact;
}

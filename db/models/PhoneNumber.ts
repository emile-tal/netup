import { relation, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';
import Contact from './Contact';

export default class PhoneNumber extends Model {
  static table = 'phoneNumbers' as const;
  static associations = {
    contact: { type: 'belongs_to', key: 'contact_id' },
  } as const;

  @text('label') label!: string;
  @text('areaCode') areaCode?: string;
  @text('phoneNumber') phoneNumber!: string;
  @text('contact_id') contactId!: string;

  @relation('contacts', 'contact_id') contact!: Contact;
}

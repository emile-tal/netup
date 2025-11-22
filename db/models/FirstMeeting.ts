import { relation, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';
import Contact from './Contact';

export default class FirstMeeting extends Model {
  static table = 'firstMeetings' as const;
  static associations = {
    contact: { type: 'belongs_to', key: 'contact_id' },
  } as const;

  @text('date') date?: string;
  @text('location') location?: string;
  @text('contact_id') contactId!: string;

  @relation('contacts', 'contact_id') contact!: Contact;
}

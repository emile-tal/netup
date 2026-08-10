import { children, field, text } from '@nozbe/watermelondb/decorators';

import { Model, Query } from '@nozbe/watermelondb';
import Address from './Address';
import Email from './Email';
import PhoneNumber from './PhoneNumber';
import Reminder from './Reminder';

export default class Contact extends Model {
  static table = 'contacts' as const;
  static associations = {
    emails: { type: 'has_many', foreignKey: 'contact_id' },
    phoneNumbers: { type: 'has_many', foreignKey: 'contact_id' },
    addresses: { type: 'has_many', foreignKey: 'contact_id' },
    reminders: { type: 'has_many', foreignKey: 'contact_id' },
  } as const;

  @text('firstName') firstName?: string;
  @text('lastName') lastName?: string;
  @text('company') company?: string;
  @text('jobTitle') jobTitle?: string;
  @text('alumni') alumni?: string;
  // The 5-15-50 circle: 5 | 15 | 50, absent while unassigned. Narrow it with
  // `toTier()` from app/utils/outreach before using it as a Tier.
  @field('tier') tier?: number;
  // Epoch-ms, like every other date column.
  @field('lastOutreachAt') lastOutreachAt?: number;
  @text('source') source?: string;
  @text('notes') notes?: string;

  // firstMeeting folded in (logically 1:1). Date is epoch-ms.
  @field('firstMetDate') firstMetDate?: number;
  @text('firstMetLocation') firstMetLocation?: string;

  @children('emails') emails!: Query<Email>;
  @children('phoneNumbers') phoneNumbers!: Query<PhoneNumber>;
  @children('addresses') addresses!: Query<Address>;
  @children('reminders') reminders!: Query<Reminder>;
}

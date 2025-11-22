import { children, field, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';

export default class Contact extends Model {
  static table = 'contacts' as const;
  static associations = {
    emails: { type: 'has_many', foreignKey: 'contact_id' },
    phoneNumbers: { type: 'has_many', foreignKey: 'contact_id' },
    addresses: { type: 'has_many', foreignKey: 'contact_id' },
    firstMeetings: { type: 'has_many', foreignKey: 'contact_id' },
    reminders: { type: 'has_many', foreignKey: 'contact_id' },
  } as const;

  @text('firstName') firstName!: string;
  @text('lastName') lastName!: string;
  @text('company') company!: string;
  @text('jobTitle') jobTitle!: string;
  @text('alumni') alumni!: string;
  @field('relationshipStrength') relationshipStrength!: number;
  @field('outreachGoal') outreachGoal!: number;
  @text('source') source!: string;
  @text('notes') notes!: string;

  @children('emails') emails!: any;
  @children('phoneNumbers') phoneNumbers!: any;
  @children('addresses') addresses!: any;
  @children('firstMeetings') firstMeetings!: any;
  @children('reminders') reminders!: any;
}

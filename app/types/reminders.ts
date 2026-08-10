/**
 * Where a reminder came from. `auto` rows are generated from the contact's 5-15-50
 * cadence and are the ones the schedule maintains (see `db/repo/outreach.ts`); `manual`
 * rows the user wrote and nothing ever rewrites. Both are ordinary editable rows.
 */
export type ReminderOrigin = 'auto' | 'manual';

export interface Reminder {
  id: string;
  /** Reminders can stand alone — not every to-do is about a contact. */
  contactId?: string;
  title: string;
  date?: Date;
  completed: boolean;
  origin: ReminderOrigin;
}

/** A reminder plus the denormalized contact name the calendar displays. */
export interface ReminderSummary extends Reminder {
  contactFirstName?: string;
  contactLastName?: string;
}

/** Fields accepted when creating a reminder (the repo assigns the id). */
export type ReminderInput = Omit<Reminder, 'id' | 'completed' | 'origin'> &
  Partial<Pick<Reminder, 'completed' | 'origin'>>;

export interface Reminder {
  id: string;
  /** Reminders can stand alone — not every to-do is about a contact. */
  contactId?: string;
  title: string;
  date?: Date;
  completed: boolean;
}

/** A reminder plus the denormalized contact name the calendar/agenda display. */
export interface ReminderSummary extends Reminder {
  contactFirstName?: string;
  contactLastName?: string;
}

/** Fields accepted when creating a reminder (the repo assigns the id). */
export type ReminderInput = Omit<Reminder, 'id' | 'completed'> &
  Partial<Pick<Reminder, 'completed'>>;

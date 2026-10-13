/**
 * Where a outreach came from. `auto` rows are generated from the contact's 5-15-50
 * cadence and are the ones the schedule maintains (see `db/repo/outreach.ts`); `manual`
 * rows the user wrote and nothing ever rewrites. Both are ordinary editable rows.
 */
export type OutreachOrigin = 'auto' | 'manual';

export interface Outreach {
  id: string;
  /** Outreach can stand alone — not every to-do is about a contact. */
  contactId?: string;
  title: string;
  date?: Date;
  completed: boolean;
  origin: OutreachOrigin;
}

/** A outreach plus the denormalized contact name the calendar displays. */
export interface OutreachSummary extends Outreach {
  contactFirstName?: string;
  contactLastName?: string;
}

/** Fields accepted when creating a outreach (the repo assigns the id). */
export type OutreachInput = Omit<Outreach, 'id' | 'completed' | 'origin'> &
  Partial<Pick<Outreach, 'completed' | 'origin'>>;

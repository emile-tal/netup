export interface Email {
  id: string;
  label: string;
  email: string;
}
export interface Phone {
  id: string;
  label: string;
  areaCode?: string;
  phoneNumber: string;
}

export interface Address {
  id: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface FirstMeeting {
  id: string;
  date?: Date;
  location?: string;
}

/**
 * The 5-15-50 circles. The number *is* the intended size of the circle, and it drives the
 * outreach cadence — see `app/utils/outreach.ts`.
 */
export type Tier = 5 | 15 | 50;

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  alumni: string;
  /** Which 5-15-50 circle the contact sits in; `null` while unassigned. */
  tier: Tier | null;
  /**
   * When the user last reached out. Set by completing a generated outreach reminder,
   * and the anchor the next one is counted from.
   */
  lastOutreachAt?: Date;
  source: string;
  notes: string;
  emails: Email[];
  phones: Phone[];
  addresses: Address[];
  firstMeeting: FirstMeeting;
}

/**
 * What the contacts list and the 5-15-50 board need to draw a row — never the full
 * aggregate. `tier`/`lastOutreachAt` are here so the board can bucket and label contacts
 * from one subscription instead of reading each contact.
 */
export interface ContactSummary {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  tier: Tier | null;
  lastOutreachAt?: Date;
}

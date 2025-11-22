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

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  alumni: string;
  relationshipStrength: number;
  outreachGoal: number;
  source: string;
  notes: string;
  emails: Email[];
  phones: Phone[];
  addresses: Address[];
  firstMeeting: FirstMeeting;
}

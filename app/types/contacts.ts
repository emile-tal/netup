export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface FirstMeeting {
  date?: Date;
  location?: string;
}

export interface Contact {
  id: string;
  firstName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  company?: string;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  alumni?: string;
  relationshipStrength?: number;
  outreachGoal?: number;
  source?: string;
  firstMeeting?: FirstMeeting;
  notes?: string;
}

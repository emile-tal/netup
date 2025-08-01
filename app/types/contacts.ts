export interface Contact {
  id: string;
  firstName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  company?: string;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  communicationPreferences?: {
    email?: boolean;
    phone?: boolean;
    linkedin?: boolean;
    instagram?: boolean;
    whatsapp?: boolean;
  };
  schoolAlumni?: string;
  relationshipStrength?: number;
  outreachGoal?: number;
  source?: string;
  firstMeeting?: {
    date?: Date;
    location?: string;
  };
  notes?: string;
}

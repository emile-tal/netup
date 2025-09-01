import { Contact } from './types/contacts';
import { Reminder } from './types/reminders';

export const contactsData: Contact[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1-555-1234',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    company: 'Acme Corp',
    jobTitle: 'Software Engineer',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2025-07-30T09:30:00Z'),
    alumni: 'Harvard University',
    relationshipStrength: 3,
    outreachGoal: 10,
    source: 'LinkedIn',
    firstMeeting: {
      date: new Date('2023-11-01'),
      location: 'Tech Conference NYC',
    },
    notes: 'Interested in AI and startups.',
  },
  {
    id: '2',
    lastName: 'Nguyen',
    email: 'minh.nguyen@example.com',
    createdAt: new Date('2024-06-10T12:00:00Z'),
    updatedAt: new Date('2025-07-25T14:15:00Z'),
    relationshipStrength: 5,
    outreachGoal: 7,
    source: 'Referral',
    notes: 'Runs a popular food blog. Met through mutual friend.',
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Martinez',
    phone: '+34-600-123-456',
    address: {
      city: 'Madrid',
      country: 'Spain',
    },
    company: 'Global Ventures',
    jobTitle: 'Investor',
    createdAt: new Date('2023-03-20T08:00:00Z'),
    updatedAt: new Date('2025-07-15T16:45:00Z'),
    relationshipStrength: 1,
    outreachGoal: 9,
    firstMeeting: {
      location: 'Zoom call',
    },
    notes: 'Follow-up about Series A fundraising in Q4.',
  },
  {
    id: '4',
    firstName: 'Fatima',
    lastName: 'Al-Farsi',
    email: 'fatima.af@example.com',
    createdAt: new Date('2022-12-05T14:30:00Z'),
    updatedAt: new Date('2025-07-29T10:10:00Z'),
    alumni: 'Oxford',
    source: 'Conference panel',
    notes: 'Expressed interest in mentoring.',
    relationshipStrength: 3,
  },
  {
    id: '5',
    lastName: 'Okoro',
    createdAt: new Date('2024-09-01T07:00:00Z'),
    updatedAt: new Date('2025-07-28T18:00:00Z'),
    outreachGoal: 3,
  },
];

export const myContactData: Contact = {
  id: '0',
  firstName: 'Sathine',
  lastName: 'Jacquemin',
  email: 'sathine.jacquemi@example.com',
  phone: '+1-555-1234',
  company: 'Bro LLC',
  jobTitle: 'Chief Executive Officer',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2025-07-30T09:30:00Z'),
};

export const myRemindersData: Reminder[] = [
  {
    id: '1',
    contactId: '1',
    date: new Date('2025-09-10'),
    createdAt: new Date('2025-08-01'),
  },
  {
    id: '2',
    contactId: '1',
    date: new Date('2025-09-12'),
    createdAt: new Date('2025-08-01'),
  },
  {
    id: '3',
    contactId: '2',
    date: new Date('2025-09-10'),
    createdAt: new Date('2025-08-01'),
  },
  {
    id: '4',
    contactId: '3',
    date: new Date('2026-01-01'),
    createdAt: new Date('2025-08-01'),
  },
  {
    id: '5',
    contactId: '3',
    date: new Date('2025-06-21'),
    createdAt: new Date('2025-09-01'),
  },
  {
    id: '6',
    contactId: '1',
    date: new Date('2025-08-10'),
    createdAt: new Date('2025-09-01'),
  },
];

import { Contact } from './types/contacts';
import { Reminder } from './types/reminders';

export const contactsData: Contact[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    emails: [
      {
        id: '1',
        label: 'Work',
        email: 'alice.johnson@example.com',
      },
    ],
    phones: [
      {
        id: '1',
        label: 'Work',
        areaCode: '1',
        phoneNumber: '555-1234',
      },
    ],
    addresses: [
      {
        id: '1',
        label: 'Work',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
    ],
    company: 'Acme Corp',
    jobTitle: 'Software Engineer',
    alumni: 'Harvard University',
    relationshipStrength: 3,
    outreachGoal: 10,
    source: 'LinkedIn',
    firstMeeting: {
      id: '1',
      date: new Date('2023-11-01'),
      location: 'Tech Conference NYC',
    },
    notes: 'Interested in AI and startups.',
  },
  {
    id: '2',
    firstName: 'Minh',
    lastName: 'Nguyen',
    emails: [
      {
        id: '2',
        label: 'Personal',
        email: 'minh.nguyen@example.com',
      },
    ],
    phones: [
      {
        id: '2',
        label: 'Mobile',
        areaCode: '1',
        phoneNumber: '555-5678',
      },
    ],
    addresses: [
      {
        id: '2',
        label: 'Home',
        street: '456 Oak Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'USA',
      },
    ],
    company: 'Food Blog Media',
    jobTitle: 'Content Creator',
    alumni: 'UC Berkeley',
    relationshipStrength: 5,
    outreachGoal: 7,
    source: 'Referral',
    firstMeeting: {
      id: '2',
      date: new Date('2024-06-10'),
      location: 'Coffee shop',
    },
    notes: 'Runs a popular food blog. Met through mutual friend.',
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Martinez',
    emails: [
      {
        id: '3',
        label: 'Work',
        email: 'carlos.martinez@globalventures.com',
      },
    ],
    phones: [
      {
        id: '3',
        label: 'Work',
        areaCode: '34',
        phoneNumber: '600-123-456',
      },
    ],
    addresses: [
      {
        id: '3',
        label: 'Office',
        street: 'Calle Gran Vía 45',
        city: 'Madrid',
        state: 'Madrid',
        zip: '28013',
        country: 'Spain',
      },
    ],
    company: 'Global Ventures',
    jobTitle: 'Investor',
    alumni: 'IESE Business School',
    relationshipStrength: 1,
    outreachGoal: 9,
    source: 'LinkedIn',
    firstMeeting: {
      id: '3',
      location: 'Zoom call',
    },
    notes: 'Follow-up about Series A fundraising in Q4.',
  },
  {
    id: '4',
    firstName: 'Fatima',
    lastName: 'Al-Farsi',
    emails: [
      {
        id: '4',
        label: 'Work',
        email: 'fatima.af@example.com',
      },
      {
        id: '5',
        label: 'Personal',
        email: 'fatima.personal@example.com',
      },
    ],
    phones: [
      {
        id: '4',
        label: 'Work',
        areaCode: '44',
        phoneNumber: '20-7946-0958',
      },
    ],
    addresses: [
      {
        id: '4',
        label: 'Work',
        city: 'London',
        country: 'UK',
      },
    ],
    company: 'Tech Mentorship Network',
    jobTitle: 'Senior Advisor',
    alumni: 'Oxford',
    relationshipStrength: 3,
    outreachGoal: 8,
    source: 'Conference panel',
    firstMeeting: {
      id: '4',
      date: new Date('2022-12-05'),
      location: 'Tech Conference London',
    },
    notes: 'Expressed interest in mentoring.',
  },
  {
    id: '5',
    firstName: 'Chukwuemeka',
    lastName: 'Okoro',
    emails: [
      {
        id: '6',
        label: 'Work',
        email: 'c.okoro@example.com',
      },
    ],
    phones: [
      {
        id: '5',
        label: 'Mobile',
        areaCode: '234',
        phoneNumber: '803-123-4567',
      },
    ],
    addresses: [
      {
        id: '5',
        label: 'Home',
        city: 'Lagos',
        country: 'Nigeria',
      },
    ],
    company: 'Startup Hub Africa',
    jobTitle: 'Founder',
    alumni: 'University of Lagos',
    relationshipStrength: 2,
    outreachGoal: 3,
    source: 'Twitter',
    firstMeeting: {
      id: '5',
    },
    notes: 'Building a tech incubator in Lagos.',
  },
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Chen',
    emails: [
      {
        id: '7',
        label: 'Work',
        email: 'sarah.chen@techcorp.com',
      },
    ],
    phones: [
      {
        id: '6',
        label: 'Work',
        areaCode: '1',
        phoneNumber: '555-9876',
      },
      {
        id: '7',
        label: 'Mobile',
        areaCode: '1',
        phoneNumber: '555-9877',
      },
    ],
    addresses: [
      {
        id: '6',
        label: 'Work',
        street: '789 Tech Boulevard',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        country: 'USA',
      },
    ],
    company: 'TechCorp',
    jobTitle: 'Product Manager',
    alumni: 'Stanford University',
    relationshipStrength: 4,
    outreachGoal: 6,
    source: 'Industry event',
    firstMeeting: {
      id: '6',
      date: new Date('2024-03-15'),
      location: 'ProductCon Seattle',
    },
    notes: 'Great insights on product strategy. Potential collaboration opportunity.',
  },
  {
    id: '7',
    firstName: 'James',
    lastName: 'Wilson',
    emails: [
      {
        id: '8',
        label: 'Work',
        email: 'james.wilson@venturecapital.com',
      },
    ],
    phones: [
      {
        id: '8',
        label: 'Work',
        areaCode: '1',
        phoneNumber: '555-2468',
      },
    ],
    addresses: [
      {
        id: '7',
        label: 'Office',
        street: '321 Wall Street',
        city: 'New York',
        state: 'NY',
        zip: '10005',
        country: 'USA',
      },
    ],
    company: 'Venture Capital Partners',
    jobTitle: 'Partner',
    alumni: 'Wharton School',
    relationshipStrength: 2,
    outreachGoal: 5,
    source: 'LinkedIn',
    firstMeeting: {
      id: '7',
      date: new Date('2024-08-20'),
      location: 'Networking event',
    },
    notes: 'Interested in early-stage startups. Follow up on pitch deck.',
  },
  {
    id: '8',
    firstName: 'Priya',
    lastName: 'Patel',
    emails: [
      {
        id: '9',
        label: 'Work',
        email: 'priya.patel@designstudio.com',
      },
      {
        id: '10',
        label: 'Personal',
        email: 'priya.designs@example.com',
      },
    ],
    phones: [
      {
        id: '9',
        label: 'Mobile',
        areaCode: '1',
        phoneNumber: '555-3691',
      },
    ],
    addresses: [
      {
        id: '8',
        label: 'Studio',
        street: '654 Creative Lane',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90028',
        country: 'USA',
      },
    ],
    company: 'Design Studio',
    jobTitle: 'Creative Director',
    alumni: 'Art Center College of Design',
    relationshipStrength: 5,
    outreachGoal: 4,
    source: 'Referral',
    firstMeeting: {
      id: '8',
      date: new Date('2023-05-10'),
      location: 'Design conference',
    },
    notes: 'Excellent designer. Discussed potential branding project.',
  },
  {
    id: '9',
    firstName: 'David',
    lastName: 'Kim',
    emails: [
      {
        id: '11',
        label: 'Work',
        email: 'david.kim@startup.io',
      },
    ],
    phones: [
      {
        id: '10',
        label: 'Work',
        areaCode: '82',
        phoneNumber: '10-1234-5678',
      },
    ],
    addresses: [
      {
        id: '9',
        label: 'Office',
        street: 'Gangnam-daero 123',
        city: 'Seoul',
        country: 'South Korea',
      },
    ],
    company: 'Startup.io',
    jobTitle: 'CTO',
    alumni: 'KAIST',
    relationshipStrength: 3,
    outreachGoal: 7,
    source: 'Tech meetup',
    firstMeeting: {
      id: '9',
      date: new Date('2024-01-12'),
      location: 'Tech meetup Seoul',
    },
    notes: 'Building innovative SaaS platform. Potential technical partnership.',
  },
  {
    id: '10',
    firstName: 'Maria',
    lastName: 'Garcia',
    emails: [
      {
        id: '12',
        label: 'Work',
        email: 'maria.garcia@consulting.com',
      },
    ],
    phones: [
      {
        id: '11',
        label: 'Work',
        areaCode: '1',
        phoneNumber: '555-7410',
      },
    ],
    addresses: [
      {
        id: '10',
        label: 'Office',
        street: '987 Business Park',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA',
      },
    ],
    company: 'Strategic Consulting Group',
    jobTitle: 'Senior Consultant',
    alumni: 'Northwestern University',
    relationshipStrength: 4,
    outreachGoal: 8,
    source: 'Industry conference',
    firstMeeting: {
      id: '10',
      date: new Date('2024-04-22'),
      location: 'Business Strategy Summit',
    },
    notes: 'Expert in digital transformation. Valuable insights on market trends.',
  },
  {
    id: '11',
    firstName: 'Alex',
    lastName: 'Thompson',
    emails: [
      {
        id: '13',
        label: 'Work',
        email: 'alex.thompson@marketing.com',
      },
    ],
    phones: [
      {
        id: '12',
        label: 'Mobile',
        areaCode: '1',
        phoneNumber: '555-8520',
      },
    ],
    addresses: [
      {
        id: '11',
        label: 'Home',
        street: '147 Marketing Street',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'USA',
      },
    ],
    company: 'Digital Marketing Agency',
    jobTitle: 'Marketing Director',
    alumni: 'UT Austin',
    relationshipStrength: 3,
    outreachGoal: 6,
    source: 'LinkedIn',
    firstMeeting: {
      id: '11',
      date: new Date('2024-07-08'),
      location: 'Marketing conference',
    },
    notes: 'Specializes in growth marketing. Discussed potential campaign.',
  },
  {
    id: '12',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    emails: [
      {
        id: '14',
        label: 'Work',
        email: 'yuki.tanaka@innovation.jp',
      },
    ],
    phones: [
      {
        id: '13',
        label: 'Work',
        areaCode: '81',
        phoneNumber: '90-1234-5678',
      },
    ],
    addresses: [
      {
        id: '12',
        label: 'Office',
        street: 'Shibuya 1-2-3',
        city: 'Tokyo',
        country: 'Japan',
      },
    ],
    company: 'Innovation Labs Japan',
    jobTitle: 'Research Lead',
    alumni: 'University of Tokyo',
    relationshipStrength: 2,
    outreachGoal: 5,
    source: 'Research conference',
    firstMeeting: {
      id: '12',
      date: new Date('2024-02-14'),
      location: 'AI Research Conference',
    },
    notes: 'Working on cutting-edge AI research. Potential collaboration on ML projects.',
  },
];

export const myContactData: Contact = {
  id: '0',
  firstName: 'Sathine',
  lastName: 'Jacquemin',
  emails: [
    {
      id: '0',
      label: 'Work',
      email: 'sathine.jacquemin@brollc.com',
    },
  ],
  phones: [
    {
      id: '0',
      label: 'Mobile',
      areaCode: '1',
      phoneNumber: '555-0000',
    },
  ],
  addresses: [
    {
      id: '0',
      label: 'Office',
      street: '100 Company Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
  ],
  company: 'Bro LLC',
  jobTitle: 'Chief Executive Officer',
  alumni: 'Stanford University',
  relationshipStrength: 10,
  outreachGoal: 0,
  source: 'Self',
  firstMeeting: {
    id: '0',
  },
  notes: 'My own contact information.',
};

export const myRemindersData: Reminder[] = [
  {
    id: '1',
    contactId: '1',
    title: 'Reach out to Alice',
    date: new Date('2025-09-10'),
  },
  {
    id: '2',
    contactId: '1',
    title: 'Reach out to Alice',
    date: new Date('2025-09-12'),
  },
  {
    id: '3',
    contactId: '2',
    title: 'Reach out to Minh',
    date: new Date('2025-09-10'),
  },
  {
    id: '4',
    contactId: '3',
    title: 'Reach out to Carlos',
    date: new Date('2026-01-01'),
  },
  {
    id: '5',
    contactId: '3',
    title: 'Reach out to Carlos',
    date: new Date('2025-06-21'),
  },
  {
    id: '6',
    contactId: '1',
    title: 'Reach out to Alice',
    date: new Date('2025-09-18'),
  },
  {
    id: '7',
    contactId: '1',
    title: 'Reach out to Alice',
    date: new Date('2025-09-19'),
  },
  {
    id: '8',
    contactId: '3',
    title: 'Reach out to Carlos',
    date: new Date('2025-09-20'),
  },
  {
    id: '9',
    contactId: '2',
    title: 'Reach out to Minh',
    date: new Date('2025-09-21'),
  },
  {
    id: '10',
    contactId: '4',
    title: 'Reach out to Fatima',
    date: new Date('2025-09-22'),
  },
  {
    id: '11',
    contactId: '5',
    title: 'Reach out to Chukwuemeka',
    date: new Date('2025-09-23'),
  },
  {
    id: '12',
    contactId: '5',
    title: 'Reach out to Chukwuemeka',
    date: new Date('2025-09-24'),
  },
  {
    id: '13',
    contactId: '2',
    title: 'Reach out to Minh',
    date: new Date('2025-09-25'),
  },
  {
    id: '14',
    contactId: '4',
    title: 'Undated reminder',
  },
];

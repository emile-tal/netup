export interface Reminder {
  id: string;
  contactId: string;
  title: string;
  date?: Date;
  createdAt: Date;
}

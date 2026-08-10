import { formatRelativeDate, toDayKey } from './date';

import { ReminderSummary } from '../types/reminders';

export interface ReminderSection {
  key: string;
  title: string;
  items: ReminderSummary[];
}

/**
 * Buckets reminders into day sections for the agenda. Relies on the repo's ordering
 * (undated first, then date ascending), so it only has to break on a key change.
 */
export function groupRemindersByDay(reminders: ReminderSummary[]): ReminderSection[] {
  const sections: ReminderSection[] = [];

  for (const reminder of reminders) {
    const key = reminder.date ? toDayKey(reminder.date) : 'undated';
    const current = sections[sections.length - 1];

    if (!current || current.key !== key) {
      sections.push({
        key,
        title: reminder.date ? formatRelativeDate(reminder.date) : 'No date',
        items: [reminder],
      });
    } else {
      current.items.push(reminder);
    }
  }

  return sections;
}

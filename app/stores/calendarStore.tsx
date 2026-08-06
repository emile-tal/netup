import { ReminderSummary } from '../types/reminders';
import { create } from 'zustand';
import { toDayKey } from '../utils/date';

interface CalendarStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  /** Reminders loaded from the DB (see observeReminderSummaries). */
  reminders: ReminderSummary[];
  /**
   * The same reminders bucketed by `YYYY-MM-DD`, built once per update so the calendar's
   * day cells look their reminders up instead of each filtering the whole list.
   */
  remindersByDay: Record<string, ReminderSummary[]>;
  setReminders: (reminders: ReminderSummary[]) => void;
  remindersLoading: boolean;
  setRemindersLoading: (loading: boolean) => void;
  remindersError: Error | null;
  setRemindersError: (error: Error | null) => void;
}

function groupByDay(reminders: ReminderSummary[]): Record<string, ReminderSummary[]> {
  const byDay: Record<string, ReminderSummary[]> = {};
  for (const reminder of reminders) {
    if (!reminder.date) continue;
    const key = toDayKey(reminder.date);
    (byDay[key] ??= []).push(reminder);
  }
  return byDay;
}

const useCalendarStore = create<CalendarStore>(set => ({
  selectedDate: new Date(),
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  reminders: [],
  remindersByDay: {},
  setReminders: (reminders: ReminderSummary[]) =>
    set({ reminders, remindersByDay: groupByDay(reminders) }),
  remindersLoading: true,
  setRemindersLoading: (loading: boolean) => set({ remindersLoading: loading }),
  remindersError: null,
  setRemindersError: (error: Error | null) => set({ remindersError: error }),
}));

export default useCalendarStore;

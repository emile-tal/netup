import { observeReminderSummaries } from '@/db/repo/reminders';
import { useDB } from '@/db/dbProvider';
import { useEffect } from 'react';
import useCalendarStore from '../stores/calendarStore';

/**
 * Subscribes the calendar store to the reminders table. Mounted by the calendar and
 * agenda screens; the store keeps both in sync (and pre-buckets by day for the calendar).
 */
export function useReminders() {
  const db = useDB();
  const setReminders = useCalendarStore(s => s.setReminders);
  const setRemindersLoading = useCalendarStore(s => s.setRemindersLoading);
  const setRemindersError = useCalendarStore(s => s.setRemindersError);

  useEffect(() => {
    setRemindersLoading(true);
    const subscription = observeReminderSummaries(db).subscribe({
      next: reminders => {
        setReminders(reminders);
        setRemindersError(null);
        setRemindersLoading(false);
      },
      error: (error: unknown) => {
        console.error('Error loading reminders:', error);
        setRemindersError(error instanceof Error ? error : new Error(String(error)));
        setRemindersLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db, setReminders, setRemindersLoading, setRemindersError]);
}

import { observeReminderSummaries } from '@/db/repo/reminders';
import { useDB } from '@/db/dbProvider';
import { useEffect } from 'react';
import useCalendarStore from '../stores/calendarStore';

/**
 * Subscribes the calendar store to the outreach table. Mounted by the calendar and
 * agenda screens; the store keeps both in sync (and pre-buckets by day for the calendar).
 */
export function useOutreach() {
  const db = useDB();
  const setOutreach = useCalendarStore(s => s.setOutreach);
  const setOutreachLoading = useCalendarStore(s => s.setOutreachLoading);
  const setOutreachError = useCalendarStore(s => s.setOutreachError);

  useEffect(() => {
    setOutreachLoading(true);
    const subscription = observeReminderSummaries(db).subscribe({
      next: outreach => {
        setOutreach(outreach);
        setOutreachError(null);
        setOutreachLoading(false);
      },
      error: (error: unknown) => {
        console.error('Error loading outreach:', error);
        setOutreachError(error instanceof Error ? error : new Error(String(error)));
        setOutreachLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db, setOutreach, setOutreachLoading, setOutreachError]);
}

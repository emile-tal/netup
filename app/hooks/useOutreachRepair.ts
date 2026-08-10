import { useEffect } from 'react';

import { repairOutreachReminders } from '@/db/repo/outreach';
import { useDB } from '@/db/dbProvider';

/**
 * Runs the 5-15-50 schedule repair once per app launch.
 *
 * The cadence only materializes the *next* touch per contact, so a schedule can end up
 * short one row — a write interrupted mid-transaction, or a contact tiered by a future
 * sync pull. This fills those gaps without ever moving a reminder that is already correct.
 *
 * Mount it once, high up, and never in a screen that can remount.
 */
export function useOutreachRepair() {
  const db = useDB();

  useEffect(() => {
    repairOutreachReminders(db).catch(error => {
      // Non-fatal: the board and the calendar both work off whatever rows exist, so a
      // failed repair costs a missing nudge, not a broken screen.
      console.error('Error repairing outreach reminders:', error);
    });
  }, [db]);
}

import { OutreachSummary } from '../types/outreach';
import { create } from 'zustand';
import { isSameDay, toDayKey } from '../utils/date';

interface CalendarStore {
  /**
   * The day whose drawer is unfolded in the grid, or `null` for none. Nullable because
   * pressing the open day closes it again — the drawer is a disclosure, not a cursor, so
   * "no day open" has to be representable.
   */
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  /** Press-a-day semantics: opens the day, or closes it if it is already the open one. */
  toggleSelectedDate: (date: Date) => void;
  /** Outreach loaded from the DB (see observeReminderSummaries). */
  outreach: OutreachSummary[];
  /**
   * The same outreach bucketed by `YYYY-MM-DD`, built once per update so the calendar's
   * day cells look their outreach up instead of each filtering the whole list.
   */
  outreachByDay: Record<string, OutreachSummary[]>;
  setOutreach: (outreach: OutreachSummary[]) => void;
  outreachLoading: boolean;
  setOutreachLoading: (loading: boolean) => void;
  outreachError: Error | null;
  setOutreachError: (error: Error | null) => void;
}

function groupByDay(items: OutreachSummary[]): Record<string, OutreachSummary[]> {
  const byDay: Record<string, OutreachSummary[]> = {};
  for (const item of items) {
    if (!item.date) continue;
    const key = toDayKey(item.date);
    (byDay[key] ??= []).push(item);
  }
  return byDay;
}

const useCalendarStore = create<CalendarStore>(set => ({
  // Today, so the calendar opens on something rather than on a closed grid.
  selectedDate: new Date(),
  setSelectedDate: (date: Date | null) => set({ selectedDate: date }),
  toggleSelectedDate: (date: Date) =>
    set(state => ({
      selectedDate:
        state.selectedDate && isSameDay(state.selectedDate, date) ? null : date,
    })),
  outreach: [],
  outreachByDay: {},
  setOutreach: (outreach: OutreachSummary[]) =>
    set({ outreach, outreachByDay: groupByDay(outreach) }),
  outreachLoading: true,
  setOutreachLoading: (loading: boolean) => set({ outreachLoading: loading }),
  outreachError: null,
  setOutreachError: (error: Error | null) => set({ outreachError: error }),
}));

export default useCalendarStore;

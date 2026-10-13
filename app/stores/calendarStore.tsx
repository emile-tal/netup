import { OutreachSummary } from '../types/outreach';
import { create } from 'zustand';
import { toDayKey } from '../utils/date';

interface CalendarStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
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
  selectedDate: new Date(),
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
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

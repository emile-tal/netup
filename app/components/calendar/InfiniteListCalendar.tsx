import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { FlatList } from 'react-native';
import MonthView from './MonthView';
import type { ViewToken } from 'react-native';
import useCalendarStore from '../../stores/calendarStore';

type MonthRow = { key: string; year: number; month: number }; // month 0-11

export type CalendarMonth = { year: number; month: number };

/** What the calendar screen can ask of the list from its toolbar. */
export interface InfiniteListCalendarHandle {
  /** Scrolls back to the current month and opens today's drawer. */
  scrollToToday: () => void;
}

// helpers
function addMonths({ year, month }: { year: number; month: number }, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function monthKey(y: number, m: number) {
  return `${y}-${m}`;
}

function buildRange(
  center: { year: number; month: number },
  behind: number,
  ahead: number
): MonthRow[] {
  const rows: MonthRow[] = [];
  for (let i = -behind; i <= ahead; i++) {
    const { year, month } = addMonths(center, i);
    rows.push({ key: monthKey(year, month), year, month });
  }
  return rows;
}

/** Months rendered either side of today on first mount; also today’s initial index. */
const INITIAL_SPAN = 12;

interface InfiniteListCalendarProps {
  /** Grid column width, measured by the screen so the weekday header can match it. */
  columnWidth: number;
  /** The month filling most of the viewport, as it changes — the toolbar's sticky title. */
  onVisibleMonthChange?: (month: CalendarMonth) => void;
  ref?: React.Ref<InfiniteListCalendarHandle>;
}

const InfiniteListCalendar = ({
  columnWidth,
  onVisibleMonthChange,
  ref,
}: InfiniteListCalendarProps) => {
  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }, []);

  // Start with +/- INITIAL_SPAN months around today; we’ll grow by 2 at a time.
  const [data, setData] = useState(() => buildRange(today, INITIAL_SPAN, INITIAL_SPAN));
  const listRef = useRef<FlatList<MonthRow>>(null);

  // Key of the row to keep under the viewport after a prepend, and a latch so only one
  // prepend is in flight at a time.
  const anchorKeyRef = useRef<string | null>(null);
  const prependingRef = useRef(false);
  // Prepending before the initial scroll lands would walk the list backwards forever.
  const readyRef = useRef(false);

  // Scroll to the current month on mount (post-render to avoid “out of range”). The
  // initial range is centred on today, so that row is always at INITIAL_SPAN — no
  // reactive value is involved, which is what keeps this a genuine run-once effect.
  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: INITIAL_SPAN, animated: false });
      readyRef.current = true;
    });
  }, []);

  // maintainVisibleContentPosition is iOS-only, so everywhere else a prepend leaves the
  // viewport pinned at offset 0 — which re-triggers the prepend. Restore the anchor row
  // manually once the new rows are in `data`.
  useEffect(() => {
    const key = anchorKeyRef.current;
    if (!key) return;
    anchorKeyRef.current = null;

    const index = data.findIndex(r => r.key === key);
    requestAnimationFrame(() => {
      if (index > 0) listRef.current?.scrollToIndex({ index, animated: false });
      prependingRef.current = false;
    });
  }, [data]);

  // Append 2 months when near end
  const onEndReached = useCallback(() => {
    // add two after the last item
    setData(prev => {
      const last = prev[prev.length - 1];
      const a1 = addMonths(last, 1);
      const a2 = addMonths(last, 2);

      // Check if these months already exist to avoid duplicates
      const existingKeys = new Set(prev.map(item => item.key));
      const newItems = [];

      if (!existingKeys.has(monthKey(a1.year, a1.month))) {
        newItems.push({ key: monthKey(a1.year, a1.month), ...a1 });
      }
      if (!existingKeys.has(monthKey(a2.year, a2.month))) {
        newItems.push({ key: monthKey(a2.year, a2.month), ...a2 });
      }

      return [...prev, ...newItems];
    });
  }, []);

  // Prepend 2 months when near start
  const maybePrepend = useCallback((anchorKey: string) => {
    if (!readyRef.current || prependingRef.current) return;
    prependingRef.current = true;
    anchorKeyRef.current = anchorKey;

    setData(prev => {
      const first = prev[0];
      const b1 = addMonths(first, -1);
      const b2 = addMonths(first, -2);

      // Check if these months already exist to avoid duplicates
      const existingKeys = new Set(prev.map(item => item.key));
      const newItems = [];

      if (!existingKeys.has(monthKey(b2.year, b2.month))) {
        newItems.push({ key: monthKey(b2.year, b2.month), ...b2 });
      }
      if (!existingKeys.has(monthKey(b1.year, b1.month))) {
        newItems.push({ key: monthKey(b1.year, b1.month), ...b1 });
      }

      return [...newItems, ...prev];
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToToday: () => {
        const now = new Date();
        useCalendarStore.getState().setSelectedDate(now);
        const index = data.findIndex(
          r => r.key === monthKey(now.getFullYear(), now.getMonth())
        );
        if (index >= 0) listRef.current?.scrollToIndex({ index, animated: true });
      },
    }),
    [data]
  );

  // Read through a ref: FlatList fixes its viewability callbacks at mount.
  const onVisibleMonthChangeRef = useRef(onVisibleMonthChange);
  onVisibleMonthChangeRef.current = onVisibleMonthChange;

  const firstByIndex = (tokens: ViewToken<MonthRow>[]) =>
    tokens.reduce((a, b) => ((a.index ?? Infinity) <= (b.index ?? Infinity) ? a : b));

  // Two viewability passes, because they want different thresholds. A sliver of a month
  // is enough to say we're "near start" and prepend — anchored on that row so the restore
  // effect can put it back under the viewport. The toolbar title, though, should name the
  // month you are actually looking at, so it waits for one to be half on screen.
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 10 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken<MonthRow>[] }) => {
        if (!viewableItems.length) return;
        const first = firstByIndex(viewableItems);
        if ((first.index ?? Infinity) <= 2) maybePrepend(first.item.key);
      },
    },
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken<MonthRow>[] }) => {
        if (!viewableItems.length) return;
        const { year, month } = firstByIndex(viewableItems).item;
        onVisibleMonthChangeRef.current?.({ year, month });
      },
    },
  ]).current;

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={r => r.key}
      renderItem={({ item }) => (
        <MonthView year={item.year} month={item.month} columnWidth={columnWidth} />
      )}
      showsVerticalScrollIndicator={false}
      // Forward growth
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      // Rows aren't measured yet on the first frame (notably on web); retry once measured
      // instead of surfacing a scroll error.
      onScrollToIndexFailed={({ index, averageItemLength }) => {
        listRef.current?.scrollToOffset({
          offset: index * averageItemLength,
          animated: false,
        });
        requestAnimationFrame(() =>
          listRef.current?.scrollToIndex({ index, animated: false })
        );
      }}
      // Backward growth
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      // Helps avoid jumps on iOS when prepending:
      // (supported on FlatList & SectionList, iOS only)
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      // Perf
      windowSize={7}
      maxToRenderPerBatch={10}
      removeClippedSubviews
      // If most rows are similar height, consider getItemLayout for faster jumps
      // getItemLayout={(data, index) => ({length: EST_ROW_HEIGHT, offset: EST_ROW_HEIGHT * index, index})}
    />
  );
};

export default InfiniteListCalendar;

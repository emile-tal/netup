import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FlatList } from 'react-native';
import MonthView from './MonthView';

type MonthRow = { key: string; year: number; month: number }; // month 0-11

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

interface InfiniteListCalendarProps {
  /** Grid column width, measured by the screen so the weekday header can match it. */
  columnWidth: number;
}

const InfiniteListCalendar = ({ columnWidth }: InfiniteListCalendarProps) => {
  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }, []);

  // Start with +/- 12 months around today; we’ll grow by 2 at a time.
  const [data, setData] = useState(() => buildRange(today, 12, 12));
  const listRef = useRef<FlatList<MonthRow>>(null);

  // Where “today” lives in the current data
  const centerIndex = useMemo(
    () => data.findIndex(r => r.year === today.year && r.month === today.month),
    [data, today]
  );

  // Key of the row to keep under the viewport after a prepend, and a latch so only one
  // prepend is in flight at a time.
  const anchorKeyRef = useRef<string | null>(null);
  const prependingRef = useRef(false);
  // Prepending before the initial scroll lands would walk the list backwards forever.
  const readyRef = useRef(false);

  // Scroll to the center on mount (post-render to avoid “out of range”)
  useEffect(() => {
    requestAnimationFrame(() => {
      if (centerIndex >= 0)
        listRef.current?.scrollToIndex({ index: centerIndex, animated: false });
      readyRef.current = true;
    });
  }, []); // run once

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

  // Use viewability to decide when we’re “near start”
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (!viewableItems.length) return;
    // If the first real item index in viewport is small, prepend — anchored on that row
    // so the restore effect can put it back under the viewport.
    const first = viewableItems.reduce((a: any, b: any) =>
      (a.index ?? Infinity) <= (b.index ?? Infinity) ? a : b
    );
    if ((first.index ?? Infinity) <= 2) {
      maybePrepend(first.item.key);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 10 }).current;

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
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
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

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

const InfiniteListCalendar = () => {
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

  // Scroll to the center on mount (post-render to avoid “out of range”)
  useEffect(() => {
    requestAnimationFrame(() => {
      if (centerIndex >= 0)
        listRef.current?.scrollToIndex({ index: centerIndex, animated: false });
    });
  }, []); // run once

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
  const maybePrepend = useCallback(() => {
    // iOS can keep view stable automatically:
    // maintainVisibleContentPosition handles most jumps when prepending
    // For Android, we can adjust offset after state update if needed.
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
    // If the first real item index in viewport is small, prepend.
    const minIndex = Math.min(...viewableItems.map((v: any) => v.index ?? Infinity));
    if (minIndex <= 2) {
      // tweak threshold
      maybePrepend();
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 10 }).current;

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={r => r.key}
      renderItem={({ item }) => <MonthView year={item.year} month={item.month} />}
      // Forward growth
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
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

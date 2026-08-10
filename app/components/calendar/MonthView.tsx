import { Text, View } from 'react-native';

import DayCell from './DayCell';
import { gridWidthFor, mondayFirstOffset } from './weekdays';
import { useMemo } from 'react';

/** Fixed so every month is the same height — the list's scroll anchoring depends on it. */
export const DAY_ROW_HEIGHT = 92;

interface MonthViewProps {
  year: number;
  month: number;
  /** Measured once by the calendar screen and shared with the weekday header. */
  columnWidth: number;
}

const MonthView = ({ year, month, columnWidth }: MonthViewProps) => {
  const title = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });

  // Leading blanks pad the month to its first weekday; trailing blanks fill the last row
  // so every row draws a complete set of cell borders.
  const cells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = mondayFirstOffset(year, month);
    const days = Array.from({ length: offset + daysInMonth }, (_, i) =>
      i < offset ? '' : String(i - offset + 1)
    );
    const trailing = (7 - (days.length % 7)) % 7;
    return [...days, ...Array.from({ length: trailing }, () => '')];
  }, [year, month]);

  return (
    <View className='pb-6'>
      <View className='flex-row items-baseline gap-2 px-1 pb-3 pt-5'>
        <Text className='text-[22px] font-bold text-ink'>{title}</Text>
        <Text className='text-[22px] font-light text-ink-muted'>{year}</Text>
      </View>
      <View
        className='flex-row flex-wrap border-l border-t border-line'
        style={{ width: gridWidthFor(columnWidth) }}
      >
        {cells.map((day, index) => (
          <DayCell
            key={`${year}-${month}-${index}`}
            day={day}
            month={month}
            year={year}
            columnWidth={columnWidth}
            rowHeight={DAY_ROW_HEIGHT}
          />
        ))}
      </View>
    </View>
  );
};

export default MonthView;

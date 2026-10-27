import { View } from 'react-native';

import DayCell from './DayCell';
import DayDrawer from './DayDrawer';
import MonthTitle from './MonthTitle';
import { gridWidthFor, mondayFirstOffset } from './weekdays';
import { useMemo } from 'react';
import useCalendarStore from '../../stores/calendarStore';

/** Fixed, so every week row in every month lines up. */
export const DAY_ROW_HEIGHT = 92;

interface MonthViewProps {
  year: number;
  month: number;
  /** Measured once by the calendar screen and shared with the weekday header. */
  columnWidth: number;
}

const MonthView = ({ year, month, columnWidth }: MonthViewProps) => {
  const selectedDate = useCalendarStore(state => state.selectedDate);

  // Weeks, not one wrapping row of cells: the selected day's drawer is injected *between*
  // two week rows, which a `flex-wrap` grid has no seam for.
  const weeks = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = mondayFirstOffset(year, month);
    // Leading blanks pad the month to its first weekday; trailing blanks fill the last
    // row so every row draws a complete set of cell borders.
    const days = Array.from({ length: offset + daysInMonth }, (_, i) =>
      i < offset ? '' : String(i - offset + 1)
    );
    const trailing = (7 - (days.length % 7)) % 7;
    const cells = [...days, ...Array.from({ length: trailing }, () => '')];
    return Array.from({ length: cells.length / 7 }, (_, row) =>
      cells.slice(row * 7, row * 7 + 7)
    );
  }, [year, month]);

  // Which week row the drawer follows — only in the month that owns the selected day, so
  // exactly one drawer exists across the whole list.
  // `null` once the user presses the open day again, which closes the drawer everywhere.
  const drawerAfterWeek =
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month
      ? Math.floor((mondayFirstOffset(year, month) + selectedDate.getDate() - 1) / 7)
      : -1;

  return (
    <View className='pb-6'>
      <View className='px-1 pb-3 pt-5'>
        <MonthTitle year={year} month={month} />
      </View>
      <View
        className='border-l border-t border-line'
        style={{ width: gridWidthFor(columnWidth) }}
      >
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex}>
            <View className='flex-row'>
              {week.map((day, index) => (
                <DayCell
                  key={`${year}-${month}-${weekIndex}-${index}`}
                  day={day}
                  month={month}
                  year={year}
                  columnWidth={columnWidth}
                  rowHeight={DAY_ROW_HEIGHT}
                />
              ))}
            </View>
            {weekIndex === drawerAfterWeek && selectedDate && (
              <DayDrawer date={selectedDate} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default MonthView;

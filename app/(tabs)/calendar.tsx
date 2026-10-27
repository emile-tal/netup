import InfiniteListCalendar, {
  type CalendarMonth,
  type InfiniteListCalendarHandle,
} from '../components/calendar/InfiniteListCalendar';
import { useCallback, useRef, useState } from 'react';

import AddOutreachModal from '../components/calendar/AddOutreachModal';
import CalendarAddIcon from '../icons/CalendarAddIcon';
import { GRID_BORDER_WIDTH } from '../components/calendar/weekdays';
import MonthTitle from '../components/calendar/MonthTitle';
import PageToolbar from '../components/PageToolbar';
import ScreenLayout from '../components/ScreenLayout';
import { View } from 'react-native';
import WeekdayHeader from '../components/calendar/WeekdayHeader';
import { colors } from '../theme';
import { useOutreach } from '../hooks/useOutreach';

const thisMonth = (): CalendarMonth => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
};

const CalendarPage = () => {
  // Keeps the calendar store in sync with the outreach table; DayCell reads from it.
  useOutreach();
  const [addVisible, setAddVisible] = useState(false);
  // The month in view, reported by the list as it scrolls: the toolbar keeps it on screen
  // after that month's own title has scrolled away.
  const [visibleMonth, setVisibleMonth] = useState(thisMonth);
  // Viewability fires on every scroll step; only a new month should re-render the page.
  const handleVisibleMonth = useCallback(
    (next: CalendarMonth) =>
      setVisibleMonth(prev =>
        prev.year === next.year && prev.month === next.month ? prev : next
      ),
    []
  );
  const calendarRef = useRef<InfiniteListCalendarHandle>(null);
  // Measured rather than derived from the window, because the content column is capped
  // and padded — the grid has to fit the column, not the viewport.
  const [gridWidth, setGridWidth] = useState(0);
  // The grid draws a 1px border down its left edge, so seven columns have to fit in
  // `gridWidth - 1`. Rounding up here would wrap the last column onto its own row.
  const columnWidth = Math.floor((gridWidth - GRID_BORDER_WIDTH) / 7);

  return (
    <ScreenLayout
      toolbar={
        <PageToolbar
          secondaryActionText='Today'
          onSecondaryActionPress={() => calendarRef.current?.scrollToToday()}
          actionIcon={<CalendarAddIcon size={22} color={colors.black} />}
          actionEmphasis='brand'
          actionLabel='Add outreach'
          onActionPress={() => setAddVisible(true)}
        >
          <MonthTitle year={visibleMonth.year} month={visibleMonth.month} />
        </PageToolbar>
      }
    >
      <View
        className='flex-1'
        onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
      >
        {columnWidth > 0 && (
          <>
            <WeekdayHeader columnWidth={columnWidth} />
            <InfiniteListCalendar
              ref={calendarRef}
              columnWidth={columnWidth}
              onVisibleMonthChange={handleVisibleMonth}
            />
          </>
        )}
      </View>
      <AddOutreachModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </ScreenLayout>
  );
};

export default CalendarPage;

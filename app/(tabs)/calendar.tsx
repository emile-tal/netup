import AddIcon from '../icons/AddIcon';
import AddReminderModal from '../components/calendar/AddReminderModal';
import Header from '../components/Header';
import InfiniteListCalendar from '../components/calendar/InfiniteListCalendar';
import ScreenLayout from '../components/ScreenLayout';
import WeekdayHeader from '../components/calendar/WeekdayHeader';
import { GRID_BORDER_WIDTH } from '../components/calendar/weekdays';
import { View } from 'react-native';
import { useReminders } from '../hooks/useReminders';
import { useState } from 'react';

const CalendarPage = () => {
  // Keeps the calendar store in sync with the reminders table; DayCell reads from it.
  useReminders();
  const [addVisible, setAddVisible] = useState(false);
  // Measured rather than derived from the window, because the content column is capped
  // and padded — the grid has to fit the column, not the viewport.
  const [gridWidth, setGridWidth] = useState(0);
  // The grid draws a 1px border down its left edge, so seven columns have to fit in
  // `gridWidth - 1`. Rounding up here would wrap the last column onto its own row.
  const columnWidth = Math.floor((gridWidth - GRID_BORDER_WIDTH) / 7);

  return (
    <ScreenLayout width='wide'>
      <Header
        title='Calendar'
        actionIcon={<AddIcon size={22} color='white' />}
        actionEmphasis='brand'
        actionLabel='Add reminder'
        onActionPress={() => setAddVisible(true)}
      />
      <View
        className='flex-1'
        onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
      >
        {columnWidth > 0 && (
          <>
            <WeekdayHeader columnWidth={columnWidth} />
            <InfiniteListCalendar columnWidth={columnWidth} />
          </>
        )}
      </View>
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </ScreenLayout>
  );
};

export default CalendarPage;

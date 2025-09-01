import { useCallback, useEffect, useState } from 'react';
import { CalendarList, DateData } from 'react-native-calendars';

import { SafeAreaView } from 'react-native';
import ExpandableCalendarView from '../components/calendar/ExpandableCalendarView';
import Header from '../components/Header';
import { myRemindersData } from '../placeholderData';
import useCalendarStore from '../stores/calendarStore';

export default function CalendarPage() {
  const setReminders = useCalendarStore(state => state.setReminders);
  const reminders = useCalendarStore(state => state.reminders);
  const [showExpandable, setShowExpandable] = useState(false);
  const setSelectedDate = useCalendarStore(state => state.setSelectedDate);
  const setAgendaStartDate = useCalendarStore(state => state.setAgendaStartDate);
  const setAgendaEndDate = useCalendarStore(state => state.setAgendaEndDate);
  useEffect(() => {
    setReminders(myRemindersData);
  }, []);

  const onDateChanged = useCallback(
    (date: any, updateSource: any) => {
      const selectedDate = new Date(date);
      setSelectedDate(selectedDate);

      const startDate = new Date(selectedDate);
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      setAgendaStartDate(startDate);
      setAgendaEndDate(endDate);
    },
    [setAgendaStartDate, setAgendaEndDate]
  );

  const onDayPress = (date: DateData) => {
    setShowExpandable(true);
    onDateChanged(date.dateString, 'dayPress');
  };

  return (
    <SafeAreaView className='pr-4 flex-1'>
      <Header
        title='Calendar'
        onBackPress={() => setShowExpandable(false)}
        backButton={showExpandable}
      />
      {showExpandable ? (
        <ExpandableCalendarView weekView={true} onDateChanged={onDateChanged} />
      ) : (
        <CalendarList
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: 'black',
          }}
          onDayPress={onDayPress}
          style={{ height: '100%' }}
        />
      )}
    </SafeAreaView>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { CalendarList, DateData } from 'react-native-calendars';

import { SafeAreaView } from 'react-native';
import AddReminderModal from '../components/calendar/AddReminderModal';
import ExpandableCalendarView from '../components/calendar/ExpandableCalendarView';
import Header from '../components/Header';
import AddIcon from '../icons/AddIcon';
import { myRemindersData } from '../placeholderData';
import useCalendarStore from '../stores/calendarStore';

export default function CalendarPage() {
  const setReminders = useCalendarStore(state => state.setReminders);
  const reminders = useCalendarStore(state => state.reminders);
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const [showExpandable, setShowExpandable] = useState(false);
  const setSelectedDate = useCalendarStore(state => state.setSelectedDate);
  const setAgendaStartDate = useCalendarStore(state => state.setAgendaStartDate);
  const setAgendaEndDate = useCalendarStore(state => state.setAgendaEndDate);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  useEffect(() => {
    setReminders(myRemindersData);
  }, []);

  const onDateChanged = useCallback(
    (date: any, updateSource: any) => {
      const [year, month, day] = date.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
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

  const renderMonthHeader = (date: Date) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[date.getMonth()];
  };

  return (
    <SafeAreaView className='pr-4 flex-1'>
      <Header
        title={showExpandable ? renderMonthHeader(selectedDate) : 'Calendar'}
        onBackPress={() => setShowExpandable(false)}
        backButton={showExpandable}
        actionIcon={<AddIcon />}
        onActionPress={() => setShowAddReminderModal(true)}
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
      <AddReminderModal
        visible={showAddReminderModal}
        onRequestClose={() => setShowAddReminderModal(false)}
      />
    </SafeAreaView>
  );
}

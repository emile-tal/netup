import AddIcon from '../icons/AddIcon';
import AddReminderModal from '../components/calendar/AddReminderModal';
import Header from '../components/Header';
import InfiniteListCalendar from '../components/calendar/InfiniteListCalendar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReminders } from '../hooks/useReminders';
import { useState } from 'react';

const CalendarPage = () => {
  // Keeps the calendar store in sync with the reminders table; DayCell reads from it.
  useReminders();
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Header
        title='Calendar'
        actionIcon={<AddIcon />}
        onActionPress={() => setAddVisible(true)}
      />
      <InfiniteListCalendar />
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </SafeAreaView>
  );
};

export default CalendarPage;

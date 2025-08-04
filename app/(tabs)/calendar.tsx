import { CalendarList } from 'react-native-calendars';
import ExpandableCalendarView from '../components/calendar/ExpandableCalendarView';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native';
import { myRemindersData } from '../placeholderData';
import { useState } from 'react';

export default function CalendarPage() {
  const reminders = myRemindersData;
  const [showExpandable, setShowExpandable] = useState(false);

  return (
    <SafeAreaView className='pr-4 flex-1'>
      <Header
        title='Calendar'
        onBackPress={() => setShowExpandable(false)}
        backButton={showExpandable}
      />
      {showExpandable ? (
        <ExpandableCalendarView weekView={true} />
      ) : (
        <CalendarList
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: 'black',
          }}
          onDayPress={() => setShowExpandable(true)}
          style={{ height: '100%' }}
        />
      )}
    </SafeAreaView>
  );
}

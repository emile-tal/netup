import AddIcon from '../icons/AddIcon';
import AddReminderModal from '../components/calendar/AddReminderModal';
import AgendaSection from '../components/agenda/AgendaSection';
import { FlatList } from 'react-native';
import Header from '../components/Header';
import ScreenLayout from '../components/ScreenLayout';
import ScreenState from '../components/ScreenState';
import { groupRemindersByDay } from '../utils/reminders';
import useCalendarStore from '../stores/calendarStore';
import { useMemo, useState } from 'react';
import { useReminders } from '../hooks/useReminders';

const AgendaPage = () => {
  useReminders();
  // The repo already sorts: undated first, then by date ascending.
  const reminders = useCalendarStore(state => state.reminders);
  const loading = useCalendarStore(state => state.remindersLoading);
  const error = useCalendarStore(state => state.remindersError);
  const [addVisible, setAddVisible] = useState(false);

  const sections = useMemo(() => groupRemindersByDay(reminders), [reminders]);
  const open = reminders.filter(reminder => !reminder.completed).length;

  return (
    <ScreenLayout>
      <Header
        title='Agenda'
        subtitle={reminders.length > 0 ? `${open} open` : undefined}
        actionIcon={<AddIcon size={22} color='white' />}
        actionEmphasis='brand'
        actionLabel='Add reminder'
        onActionPress={() => setAddVisible(true)}
      />
      {sections.length === 0 ? (
        <ScreenState
          loading={loading}
          error={error}
          emptyMessage='Nothing scheduled'
          emptyHint='Add a reminder with the + button.'
        />
      ) : (
        <FlatList
          data={sections}
          renderItem={({ item }) => <AgendaSection section={item} />}
          keyExtractor={section => section.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </ScreenLayout>
  );
};

export default AgendaPage;

import { FlatList, Text, View } from 'react-native';

import AddIcon from '../icons/AddIcon';
import AddReminderModal from '../components/calendar/AddReminderModal';
import AgendaItem from '../components/agenda/AgendaItem';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import { formatRelativeDate } from '../utils/date';
import useCalendarStore from '../stores/calendarStore';
import { useReminders } from '../hooks/useReminders';
import { useState } from 'react';

const AgendaPage = () => {
  useReminders();
  // The repo already sorts: undated first, then by date ascending.
  const reminders = useCalendarStore(state => state.reminders);
  const loading = useCalendarStore(state => state.remindersLoading);
  const error = useCalendarStore(state => state.remindersError);
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-1 bg-white'>
        <Header
          title='Agenda'
          actionIcon={<AddIcon />}
          onActionPress={() => setAddVisible(true)}
        />
        {reminders.length === 0 ? (
          <ScreenState loading={loading} error={error} emptyMessage='No reminders yet' />
        ) : (
          <FlatList
            data={reminders}
            renderItem={({ item, index }) => {
              // A date header starts each new day; undated reminders sit above them all.
              const prevItem = index > 0 ? reminders[index - 1] : null;
              const showDateHeader =
                item.date &&
                (!prevItem ||
                  !prevItem.date ||
                  item.date.toDateString() !== prevItem.date.toDateString());

              return (
                <View className='w-full'>
                  {showDateHeader && item.date && (
                    <View className='px-4 pt-4 pb-2 bg-white'>
                      <Text className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        {formatRelativeDate(item.date)}
                      </Text>
                    </View>
                  )}
                  <AgendaItem item={item} />
                </View>
              );
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AgendaPage;

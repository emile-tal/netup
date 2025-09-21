import { FlatList, SafeAreaView, Text, View } from 'react-native';

import AgendaItem from '../components/agenda/AgendaItem';
import Header from '../components/Header';
import useCalendarStore from '../stores/calendarStore';

const AgendaPage = () => {
  const reminders = useCalendarStore(state => state.reminders);
  const sortedReminders = reminders.sort((a, b) => {
    if (!a.date) return -1;
    if (!b.date) return 1;
    return a.date.getTime() - b.date.getTime();
  });
  return (
    <SafeAreaView>
      <View className='px-4'>
        <Header title='Agenda' />
        <FlatList
          data={sortedReminders}
          renderItem={({ item, index }) => (
            <View className='w-full'>
              {item.date &&
              item.date.toDateString() !==
                sortedReminders[index - 1]?.date?.toDateString() ? (
                <Text className='text-sm text-gray-500'>{item.date.toDateString()}</Text>
              ) : null}
              <AgendaItem item={item} />
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

export default AgendaPage;

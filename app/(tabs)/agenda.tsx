import { FlatList, SafeAreaView, Text, View } from 'react-native';

import AgendaItem from '../components/agenda/AgendaItem';
import Header from '../components/Header';
import useCalendarStore from '../stores/calendarStore';

const AgendaPage = () => {
  const reminders = useCalendarStore(state => state.reminders);

  // Separate reminders with and without dates
  const remindersWithoutDate = reminders.filter(r => !r.date);
  const remindersWithDate = reminders.filter(r => r.date);

  // Sort reminders with dates by date
  const sortedRemindersWithDate = remindersWithDate.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date.getTime() - b.date.getTime();
  });

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    // Format as "Day, Month Day" (e.g., "Monday, September 10")
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Combine all items for FlatList: tasks without dates first, then tasks with dates
  const allItems = [...remindersWithoutDate, ...sortedRemindersWithDate];

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-1 bg-white'>
        <View className='px-4'>
          <Header title='Agenda' />
        </View>
        <FlatList
          data={allItems}
          renderItem={({ item, index }) => {
            // Check if we need to show a date header
            // Show header if this item has a date and it's different from the previous item's date
            const prevItem = index > 0 ? allItems[index - 1] : null;
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
                      {formatDate(item.date)}
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
      </View>
    </SafeAreaView>
  );
};

export default AgendaPage;

import { Fragment, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import AddItemButton from '../profile/AddItemButton';
import AddReminderModal from './AddReminderModal';
import Card from '../Card';
import ReminderRow from './ReminderRow';
import { formatRelativeDate, toDayKey } from '../../utils/date';
import useCalendarStore from '../../stores/calendarStore';

/** Keeps the month grid the bigger half of the screen on a phone. */
const MAX_HEIGHT = 260;

/**
 * The selected day's reminders, under the month grid. This is where a reminder is actually
 * worked on — checked off, renamed, deleted — so the calendar covers everything the
 * separate agenda screen used to.
 */
const SelectedDayPanel = () => {
  const selectedDate = useCalendarStore(state => state.selectedDate);
  // Selects the map itself, not a derived array: a selector building a new array per call
  // would hand zustand a fresh reference on every render (see CLAUDE.md §11).
  const remindersByDay = useCalendarStore(state => state.remindersByDay);
  const reminders = remindersByDay[toDayKey(selectedDate)] ?? [];
  const [addVisible, setAddVisible] = useState(false);

  return (
    <View className='pt-3'>
      <Text className='mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-subtle'>
        {formatRelativeDate(selectedDate)}
      </Text>
      <Card flush className='py-1'>
        <ScrollView style={{ maxHeight: MAX_HEIGHT }} showsVerticalScrollIndicator={false}>
          {reminders.length === 0 ? (
            <Text className='px-4 py-3 text-[14px] text-ink-subtle'>
              Nothing scheduled
            </Text>
          ) : (
            reminders.map((item, index) => (
              <Fragment key={item.id}>
                {index > 0 && <View className='ml-12 h-[1px] bg-line' />}
                <ReminderRow item={item} />
              </Fragment>
            ))
          )}
        </ScrollView>
        <AddItemButton label='Add reminder' onPress={() => setAddVisible(true)} />
      </Card>
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </View>
  );
};

export default SelectedDayPanel;

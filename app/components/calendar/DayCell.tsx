import { Text, TouchableOpacity, View } from 'react-native';
import { isSameDay, toDayKey } from '../../utils/date';

import useCalendarStore from '../../stores/calendarStore';

interface DayCellProps {
  day: string;
  month: number;
  year: number;
  columnWidth: number;
  rowHeight: number;
}

const DayCell = ({ day, month, year, columnWidth, rowHeight }: DayCellProps) => {
  const setSelectedDate = useCalendarStore(state => state.setSelectedDate);
  const selectedDate = useCalendarStore(state => state.selectedDate);
  // Leading blanks that pad the first week have no day number.
  const date = day ? new Date(year, month, parseInt(day, 10)) : null;
  // Selects the map itself, not a derived array: a selector that built a new array each
  // call would hand zustand a fresh reference on every render.
  const remindersByDay = useCalendarStore(state => state.remindersByDay);
  const reminders = date ? (remindersByDay[toDayKey(date)] ?? []) : [];

  const isToday = date ? isSameDay(date, new Date()) : false;
  const isSelected = date ? isSameDay(date, selectedDate) : false;

  return (
    <TouchableOpacity
      className='py-2'
      style={{ width: columnWidth, height: rowHeight }}
      disabled={!date}
      onPress={() => date && setSelectedDate(date)}
    >
      <View className='w-full flex items-center py-1'>
        <View
          className={`p-2 w-10 h-10 flex justify-center items-center ${
            isSelected
              ? 'bg-blue-500 rounded-full'
              : isToday
                ? 'bg-blue-100 rounded-full'
                : ''
          }`}
        >
          <Text className={`text-center ${isSelected ? 'text-white' : ''}`}>{day}</Text>
        </View>
      </View>
      {reminders.map(reminder => (
        <Text
          key={reminder.id}
          numberOfLines={1}
          className={`text-sm p-0.5 my-0.5 text-left bg-red-100 rounded-md ${
            reminder.completed ? 'line-through opacity-50' : ''
          }`}
        >
          {reminder.contactLastName || reminder.title}
        </Text>
      ))}
    </TouchableOpacity>
  );
};

export default DayCell;

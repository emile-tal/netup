import { Pressable, Text, View } from 'react-native';
import { isSameDay, toDayKey } from '../../utils/date';

import useCalendarStore from '../../stores/calendarStore';

/** Reminders past this count collapse into a "+N more" line. */
const MAX_VISIBLE_REMINDERS = 3;

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
  const overflow = reminders.length - MAX_VISIBLE_REMINDERS;

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={date ? date.toDateString() : undefined}
      style={{ width: columnWidth, height: rowHeight }}
      className={`border-b border-r border-line px-1 pt-1 ${
        date ? 'bg-surface hover:bg-surface-sunken' : 'bg-surface-muted'
      } ${isSelected ? 'bg-brand-light' : ''}`}
      disabled={!date}
      onPress={() => date && setSelectedDate(date)}
    >
      <View className='mb-1 h-6 w-6 items-center justify-center self-start rounded-full'>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            isSelected ? 'bg-brand' : isToday ? 'bg-brand-light' : ''
          }`}
        >
          <Text
            className={`text-[12px] ${
              isSelected
                ? 'font-semibold text-white'
                : isToday
                  ? 'font-semibold text-brand-dark'
                  : 'text-ink-muted'
            }`}
          >
            {day}
          </Text>
        </View>
      </View>

      {reminders.slice(0, MAX_VISIBLE_REMINDERS).map(reminder => (
        <Text
          key={reminder.id}
          numberOfLines={1}
          className={`mb-0.5 rounded px-1 py-0.5 text-[11px] ${
            reminder.completed
              ? 'bg-success-light text-success-dark line-through'
              : 'bg-brand-light text-brand-dark'
          }`}
        >
          {reminder.contactLastName || reminder.title}
        </Text>
      ))}
      {overflow > 0 && (
        <Text className='px-1 text-[10px] text-ink-subtle'>+{overflow} more</Text>
      )}
    </Pressable>
  );
};

export default DayCell;

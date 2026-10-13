import { Pressable, Text, View } from 'react-native';
import { isSameDay, toDayKey } from '../../utils/date';

import useCalendarStore from '../../stores/calendarStore';

/** Outreach past this count collapse into a "+N more" line. */
const MAX_VISIBLE_OUTREACH = 3;

interface DayCellProps {
  day: string;
  month: number;
  year: number;
  columnWidth: number;
  rowHeight: number;
}

const DayCell = ({ day, month, year, columnWidth, rowHeight }: DayCellProps) => {
  const toggleSelectedDate = useCalendarStore(state => state.toggleSelectedDate);
  const selectedDate = useCalendarStore(state => state.selectedDate);
  // Leading blanks that pad the first week have no day number.
  const date = day ? new Date(year, month, parseInt(day, 10)) : null;
  // Selects the map itself, not a derived array: a selector that built a new array each
  // call would hand zustand a fresh reference on every render.
  const outreachByDay = useCalendarStore(state => state.outreachByDay);
  const outreach = date ? (outreachByDay[toDayKey(date)] ?? []) : [];

  const isToday = date ? isSameDay(date, new Date()) : false;
  const isSelected = date && selectedDate ? isSameDay(date, selectedDate) : false;
  const overflow = outreach.length - MAX_VISIBLE_OUTREACH;

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={date ? date.toDateString() : undefined}
      style={{ width: columnWidth, height: rowHeight }}
      className={`border-b border-r border-line px-1 pt-1 ${
        date ? 'bg-surface hover:bg-grey-light' : 'bg-surface-muted'
      } ${isSelected ? 'bg-blue-lighter' : ''}`}
      disabled={!date}
      accessibilityState={{ expanded: isSelected }}
      // A press is a toggle: the day's drawer opens, and pressing the open day shuts it.
      onPress={() => date && toggleSelectedDate(date)}
    >
      <View className='mb-1 h-6 w-6 items-center justify-center self-start rounded-full'>
        <View
          // The selected day is the primary-action pair (`blue-light` + black), today is
          // the same hue one step back. Both keep black ink — see FRONTEND.md §3.
          className={`h-6 w-6 items-center justify-center rounded-full ${
            isSelected ? 'bg-blue-light' : isToday ? 'bg-blue-lighter' : ''
          }`}
        >
          <Text
            className={`font-nunito text-[12px] ${
              isSelected || isToday ? 'text-black' : 'text-ink-muted'
            }`}
          >
            {day}
          </Text>
        </View>
      </View>

      {outreach.slice(0, MAX_VISIBLE_OUTREACH).map(item => (
        <Text
          key={item.id}
          numberOfLines={1}
          // Tinted, not filled: a month grid can hold dozens of these, so the wash is a
          // `-light` and the ink does the work. Done ones cross out and go green.
          className={`font-nunito mb-0.5 rounded px-1 py-0.5 text-[11px] ${
 item.completed
 ? 'bg-success-lighter text-success-dark line-through'
 : 'bg-blue-lighter text-blue-dark'
 }`}
        >
          {item.contactLastName || item.title}
        </Text>
      ))}
      {overflow > 0 && (
        <Text className='font-nunito px-1 text-[10px] text-ink-subtle'>+{overflow} more</Text>
      )}
    </Pressable>
  );
};

export default DayCell;

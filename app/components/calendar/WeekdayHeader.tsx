import { GRID_BORDER_WIDTH, WEEKDAY_LABELS, gridWidthFor } from './weekdays';
import { Text, View } from 'react-native';

interface WeekdayHeaderProps {
  columnWidth: number;
}

/**
 * The Mon–Sun row. It lives above the scrolling month list (rather than inside each
 * month) so it stays put while you scroll, and matches the grid's width and left border
 * offset so every label sits over its column.
 */
const WeekdayHeader = ({ columnWidth }: WeekdayHeaderProps) => {
  return (
    <View
      className='flex-row border-b border-line pb-2'
      style={{ width: gridWidthFor(columnWidth), paddingLeft: GRID_BORDER_WIDTH }}
    >
      {WEEKDAY_LABELS.map(label => (
        <Text
          key={label}
          className='text-center text-[12px] font-medium text-ink-subtle'
          style={{ width: columnWidth }}
        >
          {label}
        </Text>
      ))}
    </View>
  );
};

export default WeekdayHeader;

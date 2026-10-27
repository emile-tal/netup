import { Text, View } from 'react-native';

interface MonthTitleProps {
  year: number;
  /** 0-11. */
  month: number;
}

/**
 * "October 2026", the month in ink and the year muted. Shared by each month in the list
 * and by the calendar toolbar, which keeps the month you are looking at in view.
 */
const MonthTitle = ({ year, month }: MonthTitleProps) => (
  <View className='flex-row items-baseline gap-2'>
    <Text className='font-nunito text-[22px] text-ink'>
      {new Date(year, month, 1).toLocaleString('en-US', { month: 'long' })}
    </Text>
    <Text className='font-nunito text-[22px] text-ink-muted'>{year}</Text>
  </View>
);

export default MonthTitle;

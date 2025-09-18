import { Dimensions, FlatList, Text, View } from 'react-native';

import DayCell from './DayCell';
import { useMemo } from 'react';

interface MonthViewProps {
  year: number;
  month: number;
}
const MonthView = ({ year, month }: MonthViewProps) => {
  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month]
  );
  const firstDayOfMonth = new Date(year, month, 1).getDay() - 1;
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const title = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });

  const columnWidth = (screenWidth - 36) / 7;
  const rowHeight = (screenHeight - 200) / 6;

  const cells = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, k) =>
    k < firstDayOfMonth ? '' : String(k - firstDayOfMonth + 1)
  );
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View className='flex-col w-full align-center justify-center py-2'>
      <Text className='text-3xl font-bold text-left px-3'>{title}</Text>
      <FlatList
        data={daysOfWeek}
        renderItem={({ item }: { item: string }) => (
          <Text className='text-center' style={{ width: columnWidth }}>
            {item}
          </Text>
        )}
        keyExtractor={item => item}
        numColumns={7}
        columnWrapperStyle={{
          gap: 2,
        }}
        scrollEnabled={false}
        className='mt-8 mb-4 border-b border-gray-400 pb-4'
      />
      <FlatList
        data={cells}
        renderItem={({ item }: { item: string }) => (
          <DayCell
            day={item}
            month={month}
            year={year}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
          />
        )}
        keyExtractor={item => item}
        numColumns={7}
        columnWrapperStyle={{
          gap: 2,
        }}
        scrollEnabled={false}
      />
    </View>
  );
};

export default MonthView;

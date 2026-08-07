import { FlatList, Text, View, useWindowDimensions } from 'react-native';

import DayCell from './DayCell';
import { useMemo } from 'react';

const MAX_GRID_WIDTH = 640;
const MAX_GRID_HEIGHT = 900;

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
  // useWindowDimensions (not Dimensions.get) so the grid reflows when a browser window
  // is resized — Dimensions.get is captured once at render on web.
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const title = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });

  // Cap against a phone-sized viewport so the grid doesn't stretch into huge cells on a
  // desktop browser; on any handset these clamps never bind.
  const columnWidth = (Math.min(screenWidth, MAX_GRID_WIDTH) - 36) / 7;
  const rowHeight = (Math.min(screenHeight, MAX_GRID_HEIGHT) - 200) / 6;

  const cells = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, k) =>
    k < firstDayOfMonth ? '' : String(k - firstDayOfMonth + 1)
  );
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View className='flex-col w-full align-center justify-center py-2'>
      {month === 0 && <Text className='text-3xl font-bold text-left px-3'>{year}</Text>}
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
        className='mt-8 mb-4 border-b border-gray-400 pb-4 pl-2'
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
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={7}
        columnWrapperStyle={{
          gap: 2,
        }}
        scrollEnabled={false}
        className='pl-2'
      />
    </View>
  );
};

export default MonthView;

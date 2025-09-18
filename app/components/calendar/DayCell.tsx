import { Text, View } from 'react-native';

interface DayCellProps {
  day: string;
  columnWidth: number;
  rowHeight: number;
}

const DayCell = ({ day, columnWidth, rowHeight }: DayCellProps) => {
  return (
    <View
      className='py-4 text-center items-center'
      style={{ width: columnWidth, height: rowHeight }}
    >
      <Text>{day}</Text>
    </View>
  );
};

export default DayCell;

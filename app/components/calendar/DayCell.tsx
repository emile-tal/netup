import { Text, View } from 'react-native';
import { contactsData, myRemindersData } from '../../placeholderData';

interface DayCellProps {
  day: string;
  month: number;
  year: number;
  columnWidth: number;
  rowHeight: number;
}

const DayCell = ({ day, month, year, columnWidth, rowHeight }: DayCellProps) => {
  const myReminders = myRemindersData;
  const date = new Date(year, month, parseInt(day));
  const reminders = myReminders.filter(
    reminder => reminder.date.toDateString() === date.toDateString()
  );

  const isToday = date.toDateString() === new Date().toDateString();
  return (
    <View className='py-2' style={{ width: columnWidth, height: rowHeight }}>
      <View className='w-full flex items-center py-1'>
        <View
          className={`p-2 w-10 h-10 flex justify-center items-center ${isToday ? 'bg-blue-100 rounded-full' : ''}`}
        >
          <Text className='text-center'>{day}</Text>
        </View>
      </View>
      {reminders &&
        reminders.length > 0 &&
        reminders.map(reminder => (
          <Text
            key={reminder.id}
            className='text-sm p-0.5 my-0.5 text-left bg-red-100 rounded-md truncate'
          >
            {contactsData.find(contact => contact.id === reminder.contactId)?.lastName}
          </Text>
        ))}
    </View>
  );
};

export default DayCell;

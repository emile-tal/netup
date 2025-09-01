import { Modal, Text, TouchableOpacity, View } from 'react-native';

import useCalendarStore from '@/app/stores/calendarStore';
import DateWheel from '../form/DateWheel';

interface AddReminderModalProps {
  visible: boolean;
  onRequestClose: () => void;
}

const AddReminderModal = ({ visible, onRequestClose }: AddReminderModalProps) => {
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const changeDate = (date: Date) => {
    console.log('changeDate: ', date);
  };
  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      animationType='slide'
      transparent
    >
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white rounded-2xl p-8 w-4/5 shadow-lg'>
          <Text>New Reminder</Text>
          <View className='flex-row justify-between items-center'>
            <DateWheel value={selectedDate} onChange={changeDate} />
          </View>
          <TouchableOpacity onPress={onRequestClose}>Cancel</TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddReminderModal;

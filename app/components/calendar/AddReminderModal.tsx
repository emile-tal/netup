import { useRef, useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

import useCalendarStore from '@/app/stores/calendarStore';
import DateWheel from '../form/DateWheel';

interface AddReminderModalProps {
  visible: boolean;
  onRequestClose: () => void;
}

const AddReminderModal = ({ visible, onRequestClose }: AddReminderModalProps) => {
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const [reminderTitle, setReminderTitle] = useState('');
  const inputRef = useRef<TextInput>(null);
  const changeDate = (date: Date) => {
    console.log('changeDate: ', date);
  };

  const handleClose = () => {
    if (inputRef.current && inputRef.current.isFocused()) {
      inputRef.current.blur();
    } else {
      onRequestClose();
      setReminderTitle('');
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      animationType='fade'
      transparent
      presentationStyle='overFullScreen'
    >
      <View className='flex-1 justify-center items-center bg-black/50'>
        <Pressable onPress={handleClose} className='absolute inset-0' />
        <View className='bg-white rounded-2xl p-8 w-4/5 shadow-lg'>
          <Text className='text-xl font-semibold mb-8 text-center'>New Reminder</Text>
          <View className='flex-row justify-between items-center mb-4'>
            <DateWheel value={selectedDate} onChange={changeDate} />
          </View>
          <View className='items-center mb-8'>
            <TextInput
              placeholder='Reminder Title'
              value={reminderTitle}
              onChangeText={setReminderTitle}
              className='w-full border text-[14px] border-gray-300 rounded-lg p-2 placeholder:text-gray-400'
              ref={inputRef}
            />
          </View>
          <View className='flex-row justify-end gap-4'>
            <TouchableOpacity onPress={onRequestClose} className='px-4 py-2'>
              <Text className='text-gray-600 text-base'>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // TODO: Add reminder logic here
                onRequestClose();
              }}
              className='px-4 py-2 bg-blue-500 rounded-lg'
            >
              <Text className='text-white text-base font-medium'>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddReminderModal;

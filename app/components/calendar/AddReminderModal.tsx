import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { parseDateInputValue, toDateInputValue } from '@/app/utils/date';
import { useEffect, useRef, useState } from 'react';

import { createReminder } from '@/db/repo/reminders';
import useCalendarStore from '@/app/stores/calendarStore';
import { useDB } from '@/db/dbProvider';

interface AddReminderModalProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Set when adding from a contact screen, so the reminder is linked to that contact. */
  contactId?: string;
}

const AddReminderModal = ({
  visible,
  onRequestClose,
  contactId,
}: AddReminderModalProps) => {
  const db = useDB();
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const [reminderTitle, setReminderTitle] = useState('');
  const [dateText, setDateText] = useState(() => toDateInputValue(selectedDate));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Re-seed the date each time the modal opens so it follows the day the user picked.
  useEffect(() => {
    if (visible) setDateText(toDateInputValue(selectedDate));
  }, [visible, selectedDate]);

  const parsedDate = parseDateInputValue(dateText);
  const invalidDate = dateText.trim().length > 0 && !parsedDate;

  const reset = () => {
    setReminderTitle('');
    onRequestClose();
  };

  const handleClose = () => {
    if (inputRef.current && inputRef.current.isFocused()) {
      inputRef.current.blur();
    } else {
      reset();
    }
  };

  const handleAdd = async () => {
    if (saving) return;
    if (!reminderTitle.trim()) {
      Alert.alert('Title required', 'Give the reminder a title.');
      return;
    }
    if (invalidDate) {
      Alert.alert('Invalid date', 'Use the format YYYY-MM-DD, or clear the date.');
      return;
    }

    setSaving(true);
    try {
      await createReminder(db, {
        title: reminderTitle.trim(),
        date: parsedDate,
        contactId,
      });
      reset();
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Could not save', 'The reminder was not created. Please try again.');
    } finally {
      setSaving(false);
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
          <View className='items-center mb-4'>
            <TextInput
              placeholder='Reminder Title'
              value={reminderTitle}
              onChangeText={setReminderTitle}
              className='w-full border text-[14px] border-gray-300 rounded-lg p-2 placeholder:text-gray-400'
              ref={inputRef}
            />
          </View>
          <View className='items-center mb-8'>
            <TextInput
              placeholder='YYYY-MM-DD (optional)'
              value={dateText}
              onChangeText={setDateText}
              className={`w-full border text-[14px] rounded-lg p-2 placeholder:text-gray-400 ${
                invalidDate ? 'border-red-400' : 'border-gray-300'
              }`}
            />
          </View>
          <View className='flex-row justify-end gap-4'>
            <TouchableOpacity onPress={reset} className='px-4 py-2'>
              <Text className='text-gray-600 text-base'>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              disabled={saving}
              className={`px-4 py-2 rounded-lg ${saving ? 'bg-blue-300' : 'bg-blue-500'}`}
            >
              <Text className='text-white text-base font-medium'>
                {saving ? 'Adding…' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddReminderModal;

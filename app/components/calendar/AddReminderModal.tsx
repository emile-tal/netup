import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { parseDateInputValue, toDateInputValue } from '@/app/utils/date';
import { useEffect, useRef, useState } from 'react';

import Button from '../Button';
import TextField from '../TextField';
import { createReminder } from '@/db/repo/reminders';
import { notify } from '@/app/utils/alert';
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
      notify('Title required', 'Give the reminder a title.');
      return;
    }
    if (invalidDate) {
      notify('Invalid date', 'Use the format YYYY-MM-DD, or clear the date.');
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
      notify('Could not save', 'The reminder was not created. Please try again.');
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
      <View className='flex-1 items-center justify-center bg-black/40 p-5'>
        <Pressable
          accessibilityLabel='Dismiss'
          onPress={handleClose}
          className='absolute inset-0'
        />
        <View className='w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6'>
          <Text className='mb-5 text-[18px] font-bold text-ink'>New reminder</Text>
          <View className='gap-4'>
            <TextField
              ref={inputRef}
              label='Title'
              placeholder='Coffee with Sarah'
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />
            <TextField
              label='Date'
              placeholder='YYYY-MM-DD (optional)'
              value={dateText}
              onChangeText={setDateText}
              invalid={invalidDate}
              error='Use the format YYYY-MM-DD.'
            />
          </View>
          <View className='mt-6 flex-row justify-end gap-2'>
            <Button label='Cancel' variant='ghost' onPress={reset} />
            <Button
              label={saving ? 'Adding…' : 'Add reminder'}
              onPress={handleAdd}
              disabled={saving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddReminderModal;

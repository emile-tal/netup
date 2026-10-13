import { TextInput, View } from 'react-native';
import { parseDateInputValue, toDateInputValue } from '@/app/utils/date';
import { useEffect, useRef, useState } from 'react';

import Button from '../Button';
import ModalShell from '../ModalShell';
import TextField from '../TextField';
import { createReminder } from '@/db/repo/reminders';
import { notify } from '@/app/utils/alert';
import useCalendarStore from '@/app/stores/calendarStore';
import { useDB } from '@/db/dbProvider';

interface AddOutreachModalProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Set when adding from a contact screen, so the outreach is linked to that contact. */
  contactId?: string;
}

const AddOutreachModal = ({
  visible,
  onRequestClose,
  contactId,
}: AddOutreachModalProps) => {
  const db = useDB();
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const [draftTitle, setDraftTitle] = useState('');
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
    setDraftTitle('');
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
    if (!draftTitle.trim()) {
      notify('Title required', 'Give the outreach a title.');
      return;
    }
    if (invalidDate) {
      notify('Invalid date', 'Use the format YYYY-MM-DD, or clear the date.');
      return;
    }

    setSaving(true);
    try {
      await createReminder(db, {
        title: draftTitle.trim(),
        date: parsedDate,
        contactId,
      });
      reset();
    } catch (error) {
      console.error('Error creating outreach:', error);
      notify('Could not save', 'The outreach was not created. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onRequestClose={handleClose}
      title='New outreach'
      footer={
        <>
          <Button label='Cancel' variant='grey' onPress={reset} />
          <Button
            label={saving ? 'Adding…' : 'Add outreach'}
            onPress={handleAdd}
            disabled={saving}
          />
        </>
      }
    >
      <View className='mt-5 gap-4'>
        <TextField
          ref={inputRef}
          label='Title'
          placeholder='Coffee with Sarah'
          value={draftTitle}
          onChangeText={setDraftTitle}
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
    </ModalShell>
  );
};

export default AddOutreachModal;

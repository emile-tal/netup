import { Text, TextInput, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import Button from '../Button';
import DateField from '../DateField';
import MentionTextInput from '../MentionTextInput';
import ModalShell from '../ModalShell';
import { createReminder } from '@/db/repo/reminders';
import { mentionPlainText } from '@/app/utils/mentions';
import { notify } from '@/app/utils/alert';
import { startOfDay } from '@/app/utils/date';
import useCalendarStore from '@/app/stores/calendarStore';
import { useContactDirectory } from '@/app/hooks/useContactDirectory';
import { useDB } from '@/db/dbProvider';

interface AddOutreachModalProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Set when adding from a contact screen, so the outreach is linked to that contact. */
  contactId?: string;
}

/**
 * The calendar header's (and a contact profile's) "new outreach": the same `@`-tagging
 * field as the day drawer, and the app's one date picker with no cap — an outreach is
 * usually planned ahead — and no clearing, since an undated outreach has no place on the
 * calendar. Tags here don't open their contact: leaving would throw away the
 * half-filled form.
 */
const AddOutreachModal = ({
  visible,
  onRequestClose,
  contactId,
}: AddOutreachModalProps) => {
  const db = useDB();
  const contacts = useContactDirectory();
  const selectedDate = useCalendarStore(state => state.selectedDate);
  const [draftTitle, setDraftTitle] = useState('');
  // Falls back to today: the modal is also the calendar header's action, which is
  // reachable with no day open at all.
  const [date, setDate] = useState<Date>(() =>
    startOfDay(selectedDate ?? new Date())
  );
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Re-seed the date each time the modal opens so it follows the day the user picked.
  useEffect(() => {
    if (visible) setDate(startOfDay(selectedDate ?? new Date()));
  }, [visible, selectedDate]);

  const reset = () => {
    setDraftTitle('');
    onRequestClose();
  };

  // Escape (web) first leaves the field — which also shuts an open tag popup — and only a
  // second one closes the modal.
  const handleClose = () => {
    if (inputRef.current && inputRef.current.isFocused()) {
      inputRef.current.blur();
    } else {
      reset();
    }
  };

  const handleAdd = async () => {
    if (saving) return;
    if (!mentionPlainText(draftTitle).trim()) {
      notify('Title required', 'Give the outreach a title.');
      return;
    }

    setSaving(true);
    try {
      await createReminder(db, { title: draftTitle.trim(), date, contactId });
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
        <View className='gap-1.5'>
          <Text className='font-nunito text-[12px] text-ink-subtle'>Title</Text>
          {/* The same surface as `DateField` below, so the two read as one form. */}
          <View className='rounded-lg bg-surface-muted px-2 py-1.5'>
            <MentionTextInput
              ref={inputRef}
              value={draftTitle}
              onChangeText={setDraftTitle}
              contacts={contacts}
              placeholder='Coffee with @Sarah'
              accessibilityLabel='Outreach title'
              onSubmit={() => void handleAdd()}
              linkTags={false}
            />
          </View>
        </View>
        <View className='gap-1.5'>
          <Text className='font-nunito text-[12px] text-ink-subtle'>Date</Text>
          <DateField
            value={date}
            onChange={next => next && setDate(next)}
            clearable={false}
            accessibilityLabel='Outreach date'
            pickerTitle='When?'
            maximumDate={null}
          />
        </View>
      </View>
    </ModalShell>
  );
};

export default AddOutreachModal;

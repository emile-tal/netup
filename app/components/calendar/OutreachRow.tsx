import { Pressable, Text, View } from 'react-native';
import { deleteReminder, updateReminder } from '@/db/repo/reminders';
import { useEffect, useState } from 'react';

import CheckIcon from '../../icons/CheckIcon';
import ConfirmDialog from '../ConfirmDialog';
import type { ContactSummary } from '../../types/contacts';
import MentionTextInput from '../MentionTextInput';
import { OutreachSummary } from '../../types/outreach';
import XIcon from '../../icons/XIcon';
import { colors } from '../../theme';
import { fullName } from '../../utils/string';
import { notify } from '../../utils/alert';
import { useDB } from '@/db/dbProvider';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

interface OutreachRowProps {
  item: OutreachSummary;
  /** Everyone who can be tagged with `@` — passed down so the day holds one subscription. */
  contacts: ContactSummary[];
}

/**
 * One editable outreach: check off, rename, tag a contact, delete. Generated 5-15-50
 * outreach are ordinary rows here — checking one off records the outreach and queues the
 * next touch, deleting one skips that touch (see `db/repo/outreach.ts`).
 */
const OutreachRow = ({ item, contacts }: OutreachRowProps) => {
  const db = useDB();
  // Local echo of the title so typing stays responsive; the DB write is debounced and
  // the observable pushes the canonical value back in.
  const [title, setTitle] = useState(item.title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  useEffect(() => {
    setTitle(item.title);
  }, [item.title]);

  const persistTitle = useDebouncedCallback((text: string) => {
    updateReminder(db, item.id, { title: text }).catch(error => {
      console.error('Error updating outreach title:', error);
      notify('Could not save', 'The outreach title was not updated.');
    });
  });

  const updateTitle = (text: string) => {
    setTitle(text);
    persistTitle(text);
  };

  const toggleCompleted = async () => {
    try {
      await updateReminder(db, item.id, { completed: !item.completed });
    } catch (error) {
      console.error('Error updating outreach:', error);
      notify('Could not save', 'The outreach was not updated.');
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteReminder(db, item.id);
      // No dismiss on success: the row unmounts when the observable re-emits without it.
    } catch (error) {
      console.error('Error deleting outreach:', error);
      setConfirmingDelete(false);
      notify('Could not delete', 'The outreach was not deleted.');
    } finally {
      setDeleting(false);
    }
  };

  // Marks the row as one the cadence maintains, so a rewritten date or title reads as a
  // deliberate override rather than a note that mysteriously reappears.
  const secondary = [
    fullName(item.contactFirstName, item.contactLastName),
    item.origin === 'auto' ? '5-15-50' : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className='w-full flex-row items-center gap-3 px-4 py-3 hover:bg-surface-muted'>
      <Pressable
        onPress={toggleCompleted}
        accessibilityRole='checkbox'
        accessibilityState={{ checked: !!item.completed }}
        accessibilityLabel={item.completed ? 'Mark as not done' : 'Mark as done'}
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          item.completed ? 'border-success bg-success' : 'border-line-strong hover:border-blue'
        }`}
      >
        {item.completed && <CheckIcon size={14} color={colors.black} />}
      </Pressable>

      <View className='min-w-0 flex-1'>
        <MentionTextInput
          value={title}
          onChangeText={updateTitle}
          contacts={contacts}
          placeholder='Untitled outreach'
          accessibilityLabel='Outreach title'
          struck={!!item.completed}
          muted={!!item.completed}
        />
        {secondary.length > 0 && (
          <Text className='font-nunito mt-0.5 text-[12px] text-ink-subtle'>{secondary}</Text>
        )}
      </View>

      <Pressable
        onPress={() => setConfirmingDelete(true)}
        onHoverIn={() => setDeleteHovered(true)}
        onHoverOut={() => setDeleteHovered(false)}
        accessibilityRole='button'
        accessibilityLabel='Delete outreach'
        className='h-8 w-8 items-center justify-center rounded-full hover:bg-error-lighter'
      >
        {/* The wash is `error-lighter`, so the glyph has to go with it: `errorDark` is the
            error text tone on a light surface (7.43:1), and it stays `inkSubtle` at rest
            so a list of rows isn't a column of red x's. See FRONTEND.md §3. */}
        <XIcon size={16} color={deleteHovered ? colors.errorDark : colors.inkSubtle} />
      </Pressable>

      <ConfirmDialog
        visible={confirmingDelete}
        title='Delete outreach'
        message={
          item.origin === 'auto'
            ? `Remove "${item.title}"? This counts as skipping the touch, so the next one is rescheduled.`
            : `Remove "${item.title}"?`
        }
        confirmLabel='Delete'
        busyLabel='Deleting…'
        destructive
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </View>
  );
};

export default OutreachRow;

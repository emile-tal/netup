import { Pressable, Text, TextInput, View } from 'react-native';
import { confirmDestructive, notify } from '../../utils/alert';
import { deleteReminder, updateReminder } from '@/db/repo/reminders';
import { useEffect, useState } from 'react';

import CheckIcon from '../../icons/CheckIcon';
import { ReminderSummary } from '../../types/reminders';
import XIcon from '../../icons/XIcon';
import { colors } from '../../theme';
import { fullName } from '../../utils/string';
import { noFocusRing } from '../../utils/inputStyle';
import { useDB } from '@/db/dbProvider';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

interface AgendaItemProps {
  item: ReminderSummary;
}

const AgendaItem = ({ item }: AgendaItemProps) => {
  const db = useDB();
  // Local echo of the title so typing stays responsive; the DB write is debounced and
  // the observable pushes the canonical value back in.
  const [title, setTitle] = useState(item.title);

  useEffect(() => {
    setTitle(item.title);
  }, [item.title]);

  const persistTitle = useDebouncedCallback((text: string) => {
    updateReminder(db, item.id, { title: text }).catch(error => {
      console.error('Error updating reminder title:', error);
      notify('Could not save', 'The reminder title was not updated.');
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
      console.error('Error updating reminder:', error);
      notify('Could not save', 'The reminder was not updated.');
    }
  };

  const confirmDelete = () => {
    confirmDestructive({
      title: 'Delete reminder',
      message: `Remove "${item.title}"?`,
      onConfirm: async () => {
        try {
          await deleteReminder(db, item.id);
        } catch (error) {
          console.error('Error deleting reminder:', error);
          notify('Could not delete', 'The reminder was not deleted.');
        }
      },
    });
  };

  const contactName = fullName(item.contactFirstName, item.contactLastName);

  return (
    <View className='w-full flex-row items-center gap-3 px-4 py-3 hover:bg-surface-muted'>
      <Pressable
        onPress={toggleCompleted}
        accessibilityRole='checkbox'
        accessibilityState={{ checked: !!item.completed }}
        accessibilityLabel={item.completed ? 'Mark as not done' : 'Mark as done'}
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          item.completed ? 'border-success bg-success' : 'border-line-strong hover:border-brand'
        }`}
      >
        {item.completed && <CheckIcon size={14} color='white' />}
      </Pressable>

      <View className='min-w-0 flex-1'>
        <TextInput
          className={`text-[15px] ${item.completed ? 'text-ink-subtle' : 'text-ink'}`}
          value={title}
          onChangeText={updateTitle}
          placeholder='Untitled reminder'
          placeholderTextColor={colors.inkSubtle}
          multiline
          style={[
            noFocusRing,
            { textDecorationLine: item.completed ? 'line-through' : 'none' },
          ]}
        />
        {contactName.length > 0 && (
          <Text className='mt-0.5 text-[12px] text-ink-subtle'>{contactName}</Text>
        )}
      </View>

      <Pressable
        onPress={confirmDelete}
        accessibilityRole='button'
        accessibilityLabel='Delete reminder'
        className='h-8 w-8 items-center justify-center rounded-full hover:bg-danger-light'
      >
        <XIcon size={16} color={colors.inkSubtle} />
      </Pressable>
    </View>
  );
};

export default AgendaItem;

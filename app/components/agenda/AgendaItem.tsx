import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deleteReminder, updateReminder } from '@/db/repo/reminders';
import { useEffect, useState } from 'react';

import { ReminderSummary } from '../../types/reminders';
import XIcon from '../../icons/XIcon';
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
      Alert.alert('Could not save', 'The reminder title was not updated.');
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
      Alert.alert('Could not save', 'The reminder was not updated.');
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete reminder', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(db, item.id);
          } catch (error) {
            console.error('Error deleting reminder:', error);
            Alert.alert('Could not delete', 'The reminder was not deleted.');
          }
        },
      },
    ]);
  };

  return (
    <View className='flex-row items-center w-full bg-white border-b border-gray-200'>
      <TouchableOpacity
        onPress={toggleCompleted}
        className='w-6 h-6 mr-3 ml-4 justify-center items-center'
        accessibilityLabel={item.completed ? 'Mark as not done' : 'Mark as done'}
      >
        <View
          className={`w-5 h-5 rounded-full border-2 ${
            item.completed ? 'bg-black border-black' : 'border-gray-400'
          } justify-center items-center`}
        >
          {item.completed && <View className='w-2 h-2 rounded-full bg-white' />}
        </View>
      </TouchableOpacity>
      <View className='flex-1 py-3 pr-4'>
        <TextInput
          className='text-base text-black'
          value={title}
          onChangeText={updateTitle}
          placeholderTextColor='#9CA3AF'
          multiline
          style={{
            textDecorationLine: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.5 : 1,
          }}
        />
        {item.contactLastName && (
          <Text className='text-sm text-gray-500'>
            {[item.contactFirstName, item.contactLastName].filter(Boolean).join(' ')}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={confirmDelete}
        className='px-4 py-3'
        accessibilityLabel='Delete reminder'
      >
        <XIcon cssClass='text-gray-400' />
      </TouchableOpacity>
    </View>
  );
};

export default AgendaItem;

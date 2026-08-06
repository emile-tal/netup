import { Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';

import AddReminderModal from '../calendar/AddReminderModal';
import { Reminder } from '../../types/reminders';
import { formatShortDate } from '../../utils/date';
import { observeContactReminders } from '@/db/repo/reminders';
import { useDB } from '@/db/dbProvider';

interface ContactRemindersProps {
  contactId: string;
}

/** Reminders attached to one contact, shown under their profile. */
const ContactReminders = ({ contactId }: ContactRemindersProps) => {
  const db = useDB();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    const subscription = observeContactReminders(db, contactId).subscribe({
      next: setReminders,
      error: error => console.error('Error loading contact reminders:', error),
    });
    return () => subscription.unsubscribe();
  }, [db, contactId]);

  return (
    <View className='w-full p-4 bg-white rounded-lg my-2'>
      <Text className='text-base text-gray-500 mb-2'>Reminders</Text>
      {reminders.length === 0 ? (
        <Text className='text-base text-gray-400'>None yet</Text>
      ) : (
        reminders.map(reminder => (
          <View key={reminder.id} className='flex-row justify-between py-1 gap-2'>
            <Text
              className={`text-base flex-1 ${
                reminder.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {reminder.title}
            </Text>
            {reminder.date && (
              <Text className='text-sm text-gray-500'>
                {formatShortDate(reminder.date)}
              </Text>
            )}
          </View>
        ))
      )}
      <TouchableOpacity onPress={() => setAddVisible(true)} className='py-2 self-start'>
        <Text className='text-base text-blue-500'>+ Add reminder</Text>
      </TouchableOpacity>
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
        contactId={contactId}
      />
    </View>
  );
};

export default ContactReminders;

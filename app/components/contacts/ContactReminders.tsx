import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import AddItemButton from '../profile/AddItemButton';
import AddReminderModal from '../calendar/AddReminderModal';
import Card from '../Card';
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
    <Card flush className='py-2'>
      <Text className='px-4 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-wider text-ink-subtle'>
        Reminders
      </Text>
      {reminders.length === 0 ? (
        <Text className='px-4 py-2 text-[14px] text-ink-subtle'>None yet</Text>
      ) : (
        reminders.map(reminder => (
          <View
            key={reminder.id}
            className='flex-row items-center justify-between gap-3 px-4 py-2'
          >
            <Text
              numberOfLines={2}
              className={`flex-1 text-[15px] ${
                reminder.completed ? 'text-ink-subtle line-through' : 'text-ink'
              }`}
            >
              {reminder.title}
            </Text>
            {reminder.date && (
              <Text className='text-[13px] text-ink-subtle'>
                {formatShortDate(reminder.date)}
              </Text>
            )}
          </View>
        ))
      )}
      <AddItemButton label='Add reminder' onPress={() => setAddVisible(true)} />
      <AddReminderModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
        contactId={contactId}
      />
    </Card>
  );
};

export default ContactReminders;

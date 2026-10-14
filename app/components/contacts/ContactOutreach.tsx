import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import AddItemButton from '../profile/AddItemButton';
import AddOutreachModal from '../calendar/AddOutreachModal';
import Card from '../Card';
import MentionText from '../MentionText';
import { Outreach } from '../../types/outreach';
import { formatShortDate } from '../../utils/date';
import { observeContactReminders } from '@/db/repo/reminders';
import { useDB } from '@/db/dbProvider';

interface ContactOutreachProps {
  contactId: string;
}

/** Outreach attached to one contact, shown under their profile. */
const ContactOutreach = ({ contactId }: ContactOutreachProps) => {
  const db = useDB();
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    const subscription = observeContactReminders(db, contactId).subscribe({
      next: setOutreach,
      error: error => console.error('Error loading contact outreach:', error),
    });
    return () => subscription.unsubscribe();
  }, [db, contactId]);

  return (
    <Card flush className='py-2'>
      <Text className='font-nunito px-4 pb-1 pt-2 text-[12px] uppercase tracking-wider text-ink-subtle'>
        Outreach
      </Text>
      {outreach.length === 0 ? (
        <Text className='font-nunito px-4 py-2 text-[14px] text-ink-subtle'>None yet</Text>
      ) : (
        outreach.map(outreach => (
          <View
            key={outreach.id}
            className='flex-row items-center justify-between gap-3 px-4 py-2'
          >
            <MentionText
              value={outreach.title}
              numberOfLines={2}
              className={`font-nunito flex-1 text-[15px] ${
 outreach.completed ? 'text-ink-subtle line-through' : 'text-ink'
 }`}
            />
            {outreach.date && (
              <Text className='font-nunito text-[13px] text-ink-subtle'>
                {formatShortDate(outreach.date)}
              </Text>
            )}
          </View>
        ))
      )}
      <AddItemButton label='Add outreach' onPress={() => setAddVisible(true)} />
      <AddOutreachModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
        contactId={contactId}
      />
    </Card>
  );
};

export default ContactOutreach;

import { Text, TextInput, View } from 'react-native';
import { formatShortDate, parseDateInputValue, toDateInputValue } from '../../utils/date';

import CardRow from './CardRow';
import { FirstMeeting } from '@/app/types/contacts';
import { useContactEditStore } from '../../stores/contactEditStore';
import { useState } from 'react';

interface ProfileFirstMeetingCardProps {
  firstMeeting: FirstMeeting;
  editable?: boolean;
}

const ProfileFirstMeetingCard = ({
  firstMeeting,
  editable,
}: ProfileFirstMeetingCardProps) => {
  const updateFirstMeeting = useContactEditStore(s => s.updateFirstMeeting);
  // The raw text is kept locally so a half-typed date ("2024-0") isn't thrown away by
  // the parser before the user finishes.
  const [dateText, setDateText] = useState(() => toDateInputValue(firstMeeting.date));

  const invalidDate = dateText.length > 0 && !parseDateInputValue(dateText);

  if (!editable) {
    return (
      <CardRow label='First Meeting'>
        <View className='flex-col gap-0'>
          {firstMeeting.date && (
            <Text className='text-base'>{formatShortDate(firstMeeting.date)}</Text>
          )}
          {firstMeeting.location && (
            <Text className='text-base'>{firstMeeting.location}</Text>
          )}
        </View>
      </CardRow>
    );
  }

  return (
    <CardRow label='First Meeting'>
      <View className='flex-col gap-0'>
        <TextInput
          value={dateText}
          onChangeText={text => {
            setDateText(text);
            updateFirstMeeting({ date: parseDateInputValue(text) });
          }}
          placeholder='YYYY-MM-DD'
          className={`text-base ${invalidDate ? 'text-red-500' : ''}`}
        />
        <TextInput
          value={firstMeeting.location ?? ''}
          onChangeText={location => updateFirstMeeting({ location })}
          placeholder='Location'
          className='text-base'
        />
      </View>
    </CardRow>
  );
};

export default ProfileFirstMeetingCard;

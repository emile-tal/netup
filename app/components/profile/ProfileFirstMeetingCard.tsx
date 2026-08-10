import { Text, TextInput, View } from 'react-native';
import { formatShortDate, parseDateInputValue, toDateInputValue } from '../../utils/date';

import CardRow from './CardRow';
import { FirstMeeting } from '@/app/types/contacts';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
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
      <CardRow label='First met'>
        <View>
          {firstMeeting.date && (
            <Text className='text-[15px] leading-6 text-ink'>
              {formatShortDate(firstMeeting.date)}
            </Text>
          )}
          {firstMeeting.location ? (
            <Text className='text-[15px] leading-6 text-ink-muted'>
              {firstMeeting.location}
            </Text>
          ) : null}
        </View>
      </CardRow>
    );
  }

  return (
    <CardRow label='First met'>
      <View className='gap-1'>
        <TextInput
          value={dateText}
          onChangeText={text => {
            setDateText(text);
            updateFirstMeeting({ date: parseDateInputValue(text) });
          }}
          placeholder='YYYY-MM-DD'
          placeholderTextColor={colors.inkSubtle}
          className={`rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] ${
            invalidDate ? 'text-danger' : 'text-ink'
          }`}
          style={noFocusRing}
        />
        <TextInput
          value={firstMeeting.location ?? ''}
          onChangeText={location => updateFirstMeeting({ location })}
          placeholder='Location'
          placeholderTextColor={colors.inkSubtle}
          className='rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
          style={noFocusRing}
        />
      </View>
    </CardRow>
  );
};

export default ProfileFirstMeetingCard;

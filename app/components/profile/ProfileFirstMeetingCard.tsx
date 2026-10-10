import { Text, TextInput, View } from 'react-native';

import CardRow from './CardRow';
import DateField from '../DateField';
import { FirstMeeting } from '@/app/types/contacts';
import { colors } from '../../theme';
import { formatShortDate } from '../../utils/date';
import { noFocusRing } from '../../utils/inputStyle';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileFirstMeetingCardProps {
  firstMeeting: FirstMeeting;
  editable?: boolean;
}

const ProfileFirstMeetingCard = ({
  firstMeeting,
  editable,
}: ProfileFirstMeetingCardProps) => {
  const updateFirstMeeting = useContactEditStore(s => s.updateFirstMeeting);

  if (!editable) {
    return (
      <CardRow label='First met'>
        <View>
          {firstMeeting.date && (
            <Text className='font-nunito text-[15px] leading-6 text-ink'>
              {formatShortDate(firstMeeting.date)}
            </Text>
          )}
          {firstMeeting.location ? (
            <Text className='font-nunito text-[15px] leading-6 text-ink-muted'>
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
        {/* A picker rather than a `YYYY-MM-DD` field, so there is nothing to mistype and
            no validation state to render. You cannot have met someone in the future, so
            it caps itself at today — and it starts empty, because a contact you have not
            met yet is a real case (the x clears it back to that). */}
        <DateField
          value={firstMeeting.date}
          onChange={date => updateFirstMeeting({ date })}
          placeholder='Add the date you met'
          pickerTitle='When did you meet?'
          accessibilityLabel='Date you first met'
        />
        <TextInput
          value={firstMeeting.location ?? ''}
          onChangeText={location => updateFirstMeeting({ location })}
          placeholder='Location'
          placeholderTextColor={colors.inkSubtle}
          className='font-nunito rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
          style={noFocusRing}
        />
      </View>
    </CardRow>
  );
};

export default ProfileFirstMeetingCard;

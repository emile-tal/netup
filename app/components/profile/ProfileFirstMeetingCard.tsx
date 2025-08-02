import { Text, View } from 'react-native';

import { FirstMeeting } from '@/app/types/contacts';

const ProfileFirstMeetingCard = ({ firstMeeting }: { firstMeeting: FirstMeeting }) => {
  const month = firstMeeting.date?.toLocaleString('en-US', { month: 'short' });
  const day = firstMeeting.date?.toLocaleString('en-US', { day: 'numeric' });
  const year = firstMeeting.date?.toLocaleString('en-US', { year: 'numeric' });

  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 gap-2 flex-row'>
      <View className='w-28'>
        <Text className='text-base text-gray-500'>First Meeting</Text>
      </View>
      <View className='flex-col gap-0'>
        {firstMeeting.date && (
          <Text className='text-base'>
            {month} {day}, {year}
          </Text>
        )}
        {firstMeeting.location && (
          <Text className='text-base'>{firstMeeting.location}</Text>
        )}
      </View>
    </View>
  );
};

export default ProfileFirstMeetingCard;

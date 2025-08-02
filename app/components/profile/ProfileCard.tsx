import { Address, Contact, FirstMeeting } from '../../types/contacts';
import { ScrollView, Text, View } from 'react-native';

import ProfileAddressCard from './ProfileAddressCard';
import ProfileDataCard from './ProfileTextDataCard';
import ProfileFirstMeetingCard from './ProfileFirstMeetingCard';
import ProfileNumberDataCard from './ProfileNumberDataCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileCard = ({ contact }: { contact: Contact }) => {
  const insets = useSafeAreaInsets();

  const hiddenFields = [
    'id',
    'firstName',
    'lastName',
    'jobTitle',
    'company',
    'createdAt',
    'updatedAt',
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      className='h-full w-full'
      showsVerticalScrollIndicator={false}
    >
      <View className='w-full p-4 bg-white rounded-lg mb-4'>
        <View className='flex-row items-center gap-4'>
          <View className='rounded-xl bg-gray-200 w-24 h-24'></View>
          <View className='flex-col'>
            <Text className='text-xl font-bold'>
              {contact.firstName} {contact.lastName}
            </Text>
            <Text className='text-base text-gray-500 italic'>{contact.jobTitle}</Text>
            <Text className='text-base text-gray-500'>{contact.company}</Text>
          </View>
        </View>
      </View>
      {Object.entries(contact).map(([key, value]) => {
        if (key === 'address') {
          return <ProfileAddressCard key={key} address={value as Address} />;
        } else if (key === 'firstMeeting') {
          return (
            <ProfileFirstMeetingCard key={key} firstMeeting={value as FirstMeeting} />
          );
        } else if (key === 'relationshipStrength') {
          return (
            <ProfileNumberDataCard
              key={key}
              label='Relationship Strength'
              value={value as number}
              unit='/5'
            />
          );
        } else if (key === 'outreachGoal') {
          return (
            <ProfileNumberDataCard
              key={key}
              label='Outreach Goal'
              value={value as number}
              unit='/year'
            />
          );
        } else if (!hiddenFields.includes(key)) {
          return <ProfileDataCard key={key} label={key} value={value as string} />;
        }
      })}
    </ScrollView>
  );
};

export default ProfileCard;

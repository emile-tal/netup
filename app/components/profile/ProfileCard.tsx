import { ScrollView, Text, View } from 'react-native';
import { Address, Contact, Email, FirstMeeting, Phone } from '../../types/contacts';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileAddressCard from './ProfileAddressCard';
import ProfileFirstMeetingCard from './ProfileFirstMeetingCard';
import ProfileNumberDataCard from './ProfileNumberDataCard';
import ProfilePhoneCard from './ProfilePhoneCard';
import ProfileDataCard from './ProfileTextDataCard';

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

  const sortOrder = [
    'emails',
    'phones',
    'addresses',
    'firstMeeting',
    'relationshipStrength',
    'outreachGoal',
    'notes',
    'alumni',
    'source',
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
      {Object.entries(contact)
        .sort((a, b) => sortOrder.indexOf(a[0]) - sortOrder.indexOf(b[0]))
        .map(([key, value]) => {
          if (key === 'addresses') {
            return value.map((address: Address) => (
              <ProfileAddressCard key={address.id} address={address} />
            ));
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
          } else if (key === 'emails' && value.length > 0) {
            return value.map((item: Email) => (
              <ProfileDataCard key={item.id} label={item.label} value={item.email} />
            ));
          } else if (key === 'phones' && value.length > 0) {
            return value.map((item: Phone) => (
              <ProfilePhoneCard
                key={item.id}
                label={item.label}
                areaCode={item.areaCode}
                phoneNumber={item.phoneNumber}
              />
            ));
          } else if (!hiddenFields.includes(key)) {
            return <ProfileDataCard key={key} label={key} value={value as string} />;
          }
        })}
    </ScrollView>
  );
};

export default ProfileCard;

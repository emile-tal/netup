import { Address, Contact, Email, FirstMeeting, Phone } from '../../types/contacts';
import { hiddenFields, sortOrder } from './utils';

import ProfileAddressCard from './ProfileAddressCard';
import ProfileDataCard from './ProfileTextDataCard';
import ProfileFirstMeetingCard from './ProfileFirstMeetingCard';
import ProfileKeyDataCard from './ProfileKeyDataCard';
import ProfileNumberDataCard from './ProfileNumberDataCard';
import ProfilePhoneCard from './ProfilePhoneCard';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileCardProps {
  contact: Contact;
  editable?: boolean;
}

const ProfileCard = ({ contact, editable }: ProfileCardProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      className='h-full w-full'
      showsVerticalScrollIndicator={false}
    >
      <ProfileKeyDataCard
        firstName={contact.firstName}
        lastName={contact.lastName}
        jobTitle={contact.jobTitle}
        company={contact.company}
      />
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

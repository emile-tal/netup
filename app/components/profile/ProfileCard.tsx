import { Address, Contact, Email, FirstMeeting, Phone } from '../../types/contacts';
import { hiddenFields, sortOrder } from './utils';

import AddItemButton from './AddItemButton';
import { Fragment } from 'react';
import ProfileAddressCard from './ProfileAddressCard';
import ProfileDataCard from './ProfileTextDataCard';
import ProfileEmailCard from './ProfileEmailCard';
import ProfileFirstMeetingCard from './ProfileFirstMeetingCard';
import ProfileKeyDataCard from './ProfileKeyDataCard';
import ProfileNumberDataCard from './ProfileNumberDataCard';
import ProfilePhoneCard from './ProfilePhoneCard';
import { ScrollView } from 'react-native';
import { useContactEditStore } from '../../stores/contactEditStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileCardProps {
  contact: Contact;
  editable?: boolean;
  /** Rendered inside the scroll view, below the cards (e.g. the delete action). */
  footer?: React.ReactNode;
}

const ProfileCard = ({ contact, editable, footer }: ProfileCardProps) => {
  const insets = useSafeAreaInsets();
  const working = useContactEditStore(s => s.workingContact);
  const addItem = useContactEditStore(s => s.addItem);

  // In edit mode the store is the source of truth so newly added/removed child rows
  // render immediately; the scalar cards bind to the store themselves.
  const source = editable ? (working ?? contact) : contact;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      className='h-full w-full'
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps='handled'
    >
      <ProfileKeyDataCard
        firstName={source.firstName}
        lastName={source.lastName}
        jobTitle={source.jobTitle}
        company={source.company}
        editable={editable}
      />
      {Object.entries(source)
        .sort((a, b) => sortOrder.indexOf(a[0]) - sortOrder.indexOf(b[0]))
        .map(([key, value]) => {
          if (key === 'emails') {
            const emails = value as Email[];
            if (!editable && emails.length === 0) return null;
            return (
              <Fragment key={key}>
                {emails.map(email => (
                  <ProfileEmailCard key={email.id} email={email} editable={editable} />
                ))}
                {editable && (
                  <AddItemButton label='Add email' onPress={() => addItem('emails')} />
                )}
              </Fragment>
            );
          } else if (key === 'phones') {
            const phones = value as Phone[];
            if (!editable && phones.length === 0) return null;
            return (
              <Fragment key={key}>
                {phones.map(phone => (
                  <ProfilePhoneCard key={phone.id} phone={phone} editable={editable} />
                ))}
                {editable && (
                  <AddItemButton label='Add phone' onPress={() => addItem('phones')} />
                )}
              </Fragment>
            );
          } else if (key === 'addresses') {
            const addresses = value as Address[];
            if (!editable && addresses.length === 0) return null;
            return (
              <Fragment key={key}>
                {addresses.map(address => (
                  <ProfileAddressCard
                    key={address.id}
                    address={address}
                    editable={editable}
                  />
                ))}
                {editable && (
                  <AddItemButton
                    label='Add address'
                    onPress={() => addItem('addresses')}
                  />
                )}
              </Fragment>
            );
          } else if (key === 'firstMeeting') {
            return (
              <ProfileFirstMeetingCard
                key={key}
                firstMeeting={value as FirstMeeting}
                editable={editable}
              />
            );
          } else if (key === 'relationshipStrength') {
            return (
              <ProfileNumberDataCard
                key={key}
                label='Relationship Strength'
                value={value as number}
                unit='/5'
                fieldKey='relationshipStrength'
                editable={editable}
              />
            );
          } else if (key === 'outreachGoal') {
            return (
              <ProfileNumberDataCard
                key={key}
                label='Outreach Goal'
                value={value as number}
                unit='/year'
                fieldKey='outreachGoal'
                editable={editable}
              />
            );
          } else if (!hiddenFields.includes(key)) {
            return (
              <ProfileDataCard
                key={key}
                label={key}
                value={value as string}
                fieldKey={key as keyof Contact}
                editable={editable}
              />
            );
          }
          return null;
        })}
      {footer}
    </ScrollView>
  );
};

export default ProfileCard;

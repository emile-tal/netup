import { Address, Contact, Email, FirstMeeting, Phone, Tier } from '../../types/contacts';
import { hiddenFields, sortOrder } from './utils';

import AddItemButton from './AddItemButton';
import Card from '../Card';
import { Fragment } from 'react';
import ProfileAddressCard from './ProfileAddressCard';
import ProfileDataCard from './ProfileTextDataCard';
import ProfileEmailCard from './ProfileEmailCard';
import ProfileFirstMeetingCard from './ProfileFirstMeetingCard';
import ProfileKeyDataCard from './ProfileKeyDataCard';
import ProfilePhoneCard from './ProfilePhoneCard';
import ProfileTierCard from './ProfileTierCard';
import { ScrollView, View } from 'react-native';
import { humanizeKey } from '../../utils/string';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileCardProps {
  contact: Contact;
  editable?: boolean;
  /** Rendered inside the scroll view, below the cards (e.g. the delete action). */
  footer?: React.ReactNode;
}

/** Keys that belong in the "reach them" section; everything else is context. */
const reachKeys = ['emails', 'phones', 'addresses'];

const ProfileCard = ({ contact, editable, footer }: ProfileCardProps) => {
  const working = useContactEditStore(s => s.workingContact);
  const addItem = useContactEditStore(s => s.addItem);

  // In edit mode the store is the source of truth so newly added/removed child rows
  // render immediately; the scalar cards bind to the store themselves.
  const source = editable ? (working ?? contact) : contact;

  // One entry per field, ordered by the shared config rather than object key order.
  const renderEntry = ([key, value]: [string, unknown]): React.ReactNode => {
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
    }

    if (key === 'phones') {
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
    }

    if (key === 'addresses') {
      const addresses = value as Address[];
      if (!editable && addresses.length === 0) return null;
      return (
        <Fragment key={key}>
          {addresses.map(address => (
            <ProfileAddressCard key={address.id} address={address} editable={editable} />
          ))}
          {editable && (
            <AddItemButton label='Add address' onPress={() => addItem('addresses')} />
          )}
        </Fragment>
      );
    }

    if (key === 'firstMeeting') {
      const firstMeeting = value as FirstMeeting;
      if (!editable && !firstMeeting.date && !firstMeeting.location) return null;
      return (
        <ProfileFirstMeetingCard
          key={key}
          firstMeeting={firstMeeting}
          editable={editable}
        />
      );
    }

    if (key === 'tier') {
      return (
        <ProfileTierCard
          key={key}
          tier={value as Tier | null}
          lastOutreachAt={source.lastOutreachAt}
          editable={editable}
        />
      );
    }

    // Plain text fields. Empty ones are noise on a read-only profile, but must stay
    // visible in edit mode so they can be filled in.
    const text = (value as string) ?? '';
    if (!editable && !text) return null;
    return (
      <ProfileDataCard
        key={key}
        label={humanizeKey(key)}
        value={text}
        fieldKey={key as keyof Contact}
        editable={editable}
      />
    );
  };

  const entries = Object.entries(source)
    .filter(([key]) => !hiddenFields.includes(key))
    .sort((a, b) => sortOrder.indexOf(a[0]) - sortOrder.indexOf(b[0]));

  const reachRows = entries.filter(([key]) => reachKeys.includes(key)).map(renderEntry);
  const detailRows = entries.filter(([key]) => !reachKeys.includes(key)).map(renderEntry);
  const hasRows = (rows: React.ReactNode[]) => rows.some(Boolean);

  return (
    <ScrollView
      className='h-full w-full'
      contentContainerStyle={{ paddingBottom: 32 }}
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
      {hasRows(reachRows) && (
        <Card flush className='mt-4 py-2'>
          {reachRows}
        </Card>
      )}
      {hasRows(detailRows) && (
        <Card flush className='mt-4 py-2'>
          {detailRows}
        </Card>
      )}
      {footer && <View className='mt-4'>{footer}</View>}
    </ScrollView>
  );
};

export default ProfileCard;

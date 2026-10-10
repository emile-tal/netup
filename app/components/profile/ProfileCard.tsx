import { Address, Contact, Email, FirstMeeting, Phone, Tier } from '../../types/contacts';

import Card from '../Card';
import { Fragment } from 'react';
import ProfileAddressCard from './ProfileAddressCard';
import ProfileDataCard from './ProfileTextDataCard';
import ProfileEmailCard from './ProfileEmailCard';
import ProfileFirstMeetingCard from './ProfileFirstMeetingCard';
import ProfileKeyDataCard from './ProfileKeyDataCard';
import ProfilePhoneCard from './ProfilePhoneCard';
import ProfileTierCard from './ProfileTierCard';
import { SECTIONS } from './utils';
import { ScrollView, View } from 'react-native';
import { humanizeKey } from '../../utils/string';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileCardProps {
  contact: Contact;
  editable?: boolean;
  /** Rendered inside the scroll view, below the cards (e.g. the delete action). */
  footer?: React.ReactNode;
}

const ProfileCard = ({ contact, editable, footer }: ProfileCardProps) => {
  const working = useContactEditStore(s => s.workingContact);

  // In edit mode the store is the source of truth so newly added/removed child rows
  // render immediately; the scalar cards bind to the store themselves.
  const source = editable ? (working ?? contact) : contact;

  /**
   * One field, by key. Collections carry no "add" control: the store keeps a blank row at
   * the end of emails and phones (`withTrailingBlanks`), so the next empty input is
   * already on screen, and addresses are capped at one row.
   */
  const renderField = (key: keyof Contact): React.ReactNode => {
    const value = source[key];

    if (key === 'emails') {
      const emails = value as Email[];
      if (!editable && emails.length === 0) return null;
      return (
        <Fragment key={key}>
          {emails.map(email => (
            <ProfileEmailCard key={email.id} email={email} editable={editable} />
          ))}
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
        fieldKey={key}
        editable={editable}
      />
    );
  };

  // A section with nothing to show (every field empty on a read-only profile) draws no
  // card at all, rather than an empty one.
  const sections = SECTIONS.map(keys => ({
    key: keys.join(),
    rows: keys.map(renderField),
  })).filter(section => section.rows.some(Boolean));

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
      {sections.map(section => (
        <Card key={section.key} flush className='mt-4 py-2'>
          {section.rows}
        </Card>
      ))}
      {footer && <View className='mt-4'>{footer}</View>}
    </ScrollView>
  );
};

export default ProfileCard;

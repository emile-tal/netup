import { Text, View } from 'react-native';

import Avatar from '@/app/components/Avatar';
import type { ContactSummary } from '@/db/repo/contacts';
import { fullName } from '@/app/utils/string';

interface ContactChipProps {
  contact: ContactSummary;
  /** Lifts the chip while it is being dragged, on either platform. */
  dragging?: boolean;
}

/**
 * One contact as it appears on the 5-15-50 board. Kept deliberately small: three columns
 * have to fit side by side on a phone, so this is an avatar and a name and nothing else.
 */
const ContactChip = ({ contact, dragging }: ContactChipProps) => {
  return (
    <View
      className={`w-full flex-row items-center gap-2 rounded-xl border px-2 py-2 ${
        dragging
          ? 'border-brand bg-surface shadow-lg'
          : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      <Avatar firstName={contact.firstName} lastName={contact.lastName} size={24} />
      <Text numberOfLines={2} className='min-w-0 flex-1 text-[12px] leading-4 text-ink'>
        {fullName(contact.firstName, contact.lastName) || 'Unnamed'}
      </Text>
    </View>
  );
};

export default ContactChip;

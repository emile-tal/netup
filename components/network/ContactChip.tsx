import { Text, View } from 'react-native';

import Avatar from '@/app/components/Avatar';
import type { ContactSummary } from '@/app/types/contacts';
import { fullName } from '@/app/utils/string';
import { useIsDesktop } from '@/app/hooks/useLayoutMode';

interface ContactChipProps {
  contact: ContactSummary;
  /** Lifts the chip while it is being dragged, on either platform. */
  dragging?: boolean;
}

/**
 * One contact as it appears on the 5-15-50 board. At phone width three columns sit side
 * by side, so the chip is an avatar and a name; from `md` up a column is ~300px wide and
 * the chip grows and adds the contact's role underneath.
 */
const ContactChip = ({ contact, dragging }: ContactChipProps) => {
  const isDesktop = useIsDesktop();
  const role = [contact.jobTitle, contact.company].filter(Boolean).join(' · ');

  return (
    <View
      className={`w-full flex-row items-center gap-2 rounded-xl border px-2 py-2 md:gap-3 md:px-3 md:py-2.5 ${
        dragging
          ? 'border-blue bg-surface shadow-lg'
          : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      <Avatar
        firstName={contact.firstName}
        lastName={contact.lastName}
        size={isDesktop ? 36 : 28}
      />
      <View className='min-w-0 flex-1'>
        <Text
          numberOfLines={2}
          className='font-nunito text-[13px] leading-[17px] text-ink md:text-[15px] md:leading-5'
        >
          {fullName(contact.firstName, contact.lastName) || 'Unnamed'}
        </Text>
        {isDesktop && !!role && (
          <Text numberOfLines={1} className='font-nunito text-[13px] leading-[18px] text-ink-muted'>
            {role}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ContactChip;

import { Pressable, Text, View } from 'react-native';

import Avatar from '../Avatar';
import ChevronRightIcon from '../../icons/ChevronRightIcon';
import { Link } from 'expo-router';
import { colors } from '../../theme';
import { fullName } from '../../utils/string';

interface ContactLinkProps {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  id: string;
}

/** One row in the contacts list: avatar, name, and the role/company line. */
const ContactLink = ({
  firstName,
  lastName,
  jobTitle,
  company,
  id,
}: ContactLinkProps) => {
  const secondary = [jobTitle, company].filter(Boolean).join(' · ');

  return (
    <Link href={`/contacts/${id}`} asChild>
      <Pressable
        accessibilityRole='link'
        accessibilityLabel={fullName(firstName, lastName)}
        className='w-full flex-row items-center gap-3 px-4 py-3 hover:bg-surface-muted active:bg-surface-sunken'
      >
        <Avatar firstName={firstName} lastName={lastName} size={40} />
        <View className='min-w-0 flex-1'>
          <Text numberOfLines={1} className='text-[15px] font-semibold text-ink'>
            {fullName(firstName, lastName) || 'Unnamed contact'}
          </Text>
          {secondary.length > 0 && (
            <Text numberOfLines={1} className='mt-0.5 text-[13px] text-ink-muted'>
              {secondary}
            </Text>
          )}
        </View>
        <ChevronRightIcon size={18} color={colors.inkSubtle} />
      </Pressable>
    </Link>
  );
};

export default ContactLink;

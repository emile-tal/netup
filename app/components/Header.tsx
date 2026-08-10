import { Text, View } from 'react-native';

import BackIcon from '../icons/BackIcon';
import IconButton from './IconButton';
import { colors } from '../theme';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  /** Secondary line under the title (e.g. "12 contacts"). */
  subtitle?: string;
  backIconProp?: React.ReactNode;
  backButton?: boolean;
  onBackPress?: () => void;
  actionIcon?: React.ReactNode;
  onActionPress?: () => void;
  actionLabel?: string;
  /** `brand` fills the action button — for the primary "add" on a list screen. */
  actionEmphasis?: 'plain' | 'brand';
}

/**
 * Screen header: optional back control, a left-aligned title, and one action. The title
 * is left-aligned rather than centred so it lines up with the content column beneath it.
 */
const Header = ({
  title,
  subtitle,
  backIconProp,
  backButton,
  onBackPress,
  actionIcon,
  onActionPress,
  actionLabel = 'Action',
  actionEmphasis = 'plain',
}: HeaderProps) => {
  return (
    <View className='flex-row items-center gap-2 pb-4 pt-3'>
      {backButton && (
        <View className='-ml-2'>
          <IconButton
            accessibilityLabel='Go back'
            onPress={onBackPress || (() => router.back())}
            icon={backIconProp ?? <BackIcon size={18} color={colors.ink} />}
          />
        </View>
      )}
      <View className='flex-1'>
        {title && (
          <Text
            numberOfLines={1}
            className='text-[26px] font-bold tracking-tight text-ink'
          >
            {title}
          </Text>
        )}
        {subtitle && <Text className='mt-0.5 text-[13px] text-ink-subtle'>{subtitle}</Text>}
      </View>
      {actionIcon && onActionPress && (
        <View className='-mr-2'>
          <IconButton
            accessibilityLabel={actionLabel}
            onPress={onActionPress}
            icon={actionIcon}
            emphasis={actionEmphasis}
          />
        </View>
      )}
    </View>
  );
};

export default Header;

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
  /** A second, lower-emphasis action drawn to the left of the primary one. */
  secondaryActionIcon?: React.ReactNode;
  onSecondaryActionPress?: () => void;
  secondaryActionLabel?: string;
}

/**
 * Screen header: optional back control, a left-aligned title, and up to two actions. The
 * title is left-aligned rather than centred so it lines up with the content column
 * beneath it. Only the primary action ever takes `brand` emphasis — one filled control
 * per screen (see CLAUDE.md §13).
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
  secondaryActionIcon,
  onSecondaryActionPress,
  secondaryActionLabel = 'Action',
}: HeaderProps) => {
  const hasPrimaryAction = Boolean(actionIcon && onActionPress);
  const hasSecondaryAction = Boolean(secondaryActionIcon && onSecondaryActionPress);

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
      {(hasSecondaryAction || hasPrimaryAction) && (
        <View className='-mr-2 flex-row items-center'>
          {hasSecondaryAction && (
            <IconButton
              accessibilityLabel={secondaryActionLabel}
              onPress={onSecondaryActionPress!}
              icon={secondaryActionIcon}
            />
          )}
          {hasPrimaryAction && (
            <IconButton
              accessibilityLabel={actionLabel}
              onPress={onActionPress!}
              icon={actionIcon}
              emphasis={actionEmphasis}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default Header;

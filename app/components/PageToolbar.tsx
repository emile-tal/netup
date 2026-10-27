import { Pressable, Text, View } from 'react-native';

import BackIcon from '../icons/BackIcon';
import Button from './Button';
import IconButton from './IconButton';
import { colors } from '../theme';

interface PageToolbarProps {
  /** Shows the back control on the left when set. */
  onBackPress?: () => void;
  /** Replaces the back arrow, e.g. an X that closes a form. */
  backIcon?: React.ReactNode;
  backLabel?: string;
  /** Names where back goes ("Contacts"), drawn beside the arrow. Icon-only when absent. */
  backText?: string;
  /**
   * Short context for the page, in muted ink — "New contact", "4 of 12 in a circle". Not
   * a title: the nav's filled destination already says which page this is.
   */
  label?: string;
  /** Fills the space between the back control and the actions, e.g. a search field. */
  children?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onActionPress?: () => void;
  actionLabel?: string;
  /** `brand` fills the action button — for the primary action on a screen. */
  actionEmphasis?: 'plain' | 'brand';
  /**
   * A second, lower-emphasis action drawn to the left of the primary one: an icon, or a
   * short word when no icon says it as well ("Today").
   */
  secondaryActionIcon?: React.ReactNode;
  secondaryActionText?: string;
  onSecondaryActionPress?: () => void;
  secondaryActionLabel?: string;
}

/**
 * THE row of page controls: back on the left, the page's actions on the right, and a
 * label or a search field between them. It is rendered through `ScreenLayout`'s `toolbar`
 * slot, at the top of the page column on the page's own ground — the nav owns the white
 * bar now, and the toolbar is the same on mobile and desktop. Only the primary action ever
 * takes `brand` emphasis — one filled control per screen (see CLAUDE.md §13).
 */
const PageToolbar = ({
  onBackPress,
  backIcon,
  backLabel = 'Go back',
  backText,
  label,
  children,
  actionIcon,
  onActionPress,
  actionLabel = 'Action',
  actionEmphasis = 'plain',
  secondaryActionIcon,
  secondaryActionText,
  onSecondaryActionPress,
  secondaryActionLabel = 'Action',
}: PageToolbarProps) => {
  const hasPrimaryAction = Boolean(actionIcon && onActionPress);
  const hasSecondaryAction = Boolean(
    (secondaryActionIcon || secondaryActionText) && onSecondaryActionPress
  );

  return (
    <View className='min-h-[44px] flex-row items-center gap-2'>
      {onBackPress && backText && (
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={`Back to ${backText}`}
          onPress={onBackPress}
          className='-ml-2 h-10 flex-row items-center gap-1.5 rounded-full pl-2.5 pr-3.5 hover:bg-grey-light'
        >
          {backIcon ?? <BackIcon size={18} color={colors.ink} />}
          <Text className='font-nunito-medium text-[14px] text-ink'>{backText}</Text>
        </Pressable>
      )}
      {onBackPress && !backText && (
        <View className='-ml-2'>
          <IconButton
            accessibilityLabel={backLabel}
            onPress={onBackPress}
            icon={backIcon ?? <BackIcon size={18} color={colors.ink} />}
          />
        </View>
      )}
      <View className='flex-1'>
        {children ??
          (label && (
            <Text numberOfLines={1} className='font-nunito text-[15px] text-ink-muted'>
              {label}
            </Text>
          ))}
      </View>
      {(hasSecondaryAction || hasPrimaryAction) && (
        <View className='flex-row items-center gap-2'>
          {hasSecondaryAction && secondaryActionText && (
            <Button
              label={secondaryActionText}
              variant='secondary'
              onPress={onSecondaryActionPress!}
            />
          )}
          {hasSecondaryAction && !secondaryActionText && (
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

export default PageToolbar;

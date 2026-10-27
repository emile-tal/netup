import { Pressable, Text, View } from 'react-native';

import ChevronRightIcon from '../../icons/ChevronRightIcon';
import { colors } from '../../theme';

interface AccountRowProps {
  label: string;
  value: string;
  /** Makes the row a button, with a chevron. Omit for a read-only line. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** One line of the user's account: label on the left, current value on the right. */
const AccountRow = ({ label, value, onPress, accessibilityLabel }: AccountRowProps) => {
  const content = (
    <>
      <Text className='font-nunito w-24 text-[13px] text-ink-subtle'>{label}</Text>
      <Text numberOfLines={1} className='font-nunito flex-1 text-[15px] text-ink'>
        {value}
      </Text>
      {onPress && <ChevronRightIcon size={20} color={colors.inkSubtle} />}
    </>
  );
  const row = 'min-h-[52px] flex-row items-center gap-3 px-4 py-3';

  return onPress ? (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={`${row} hover:bg-grey-lighter`}
    >
      {content}
    </Pressable>
  ) : (
    <View className={row}>{content}</View>
  );
};

export default AccountRow;

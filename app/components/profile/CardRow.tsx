import { Pressable, Text, TextInput, View } from 'react-native';

import XIcon from '../../icons/XIcon';
import { capitalize } from '../../utils/string';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';

interface CardRowProps {
  label: string;
  children: React.ReactNode;
  /** When provided, the label itself becomes editable (e.g. "Work" → "Personal"). */
  onLabelChange?: (label: string) => void;
  /** When provided, a remove control is rendered on the row (edit mode only). */
  onRemove?: () => void;
}

/**
 * One label/value line inside a profile section. The rows sit in a shared `Card`, so this
 * draws no surface of its own — only the two-column rhythm every field follows.
 */
const CardRow = ({ label, children, onLabelChange, onRemove }: CardRowProps) => {
  return (
    <View className='w-full flex-row items-start gap-3 px-4 py-2.5'>
      <View className='w-24 pt-0.5'>
        {onLabelChange ? (
          <TextInput
            value={label}
            onChangeText={onLabelChange}
            placeholder='Label'
            placeholderTextColor={colors.inkSubtle}
            className='text-[13px] text-ink-subtle'
            style={noFocusRing}
          />
        ) : (
          <Text className='text-[13px] text-ink-subtle'>{capitalize(label)}</Text>
        )}
      </View>
      <View className='min-w-0 flex-1'>{children}</View>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          accessibilityRole='button'
          accessibilityLabel={`Remove ${label}`}
          className='h-6 w-6 items-center justify-center rounded-full hover:bg-danger-light'
        >
          <XIcon size={14} color={colors.inkSubtle} />
        </Pressable>
      )}
    </View>
  );
};

export default CardRow;

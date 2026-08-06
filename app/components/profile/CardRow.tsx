import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import XIcon from '../../icons/XIcon';
import { capitalize } from '../../utils/string';

interface CardRowProps {
  label: string;
  children: React.ReactNode;
  /** When provided, the label itself becomes editable (e.g. "Work" → "Personal"). */
  onLabelChange?: (label: string) => void;
  /** When provided, a remove control is rendered on the row (edit mode only). */
  onRemove?: () => void;
}

/** Shared container for every profile card: label column + value column. */
const CardRow = ({ label, children, onLabelChange, onRemove }: CardRowProps) => {
  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 flex-row gap-2'>
      <View className='w-28'>
        {onLabelChange ? (
          <TextInput
            value={label}
            onChangeText={onLabelChange}
            placeholder='Label'
            className='text-base text-gray-500'
          />
        ) : (
          <Text className='text-base text-gray-500'>{capitalize(label)}</Text>
        )}
      </View>
      <View className='flex-1'>{children}</View>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          className='w-6 h-6 items-center justify-center'
          accessibilityLabel={`Remove ${label}`}
        >
          <XIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CardRow;

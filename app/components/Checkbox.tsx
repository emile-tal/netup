import { Pressable, Text, View } from 'react-native';

import CheckIcon from '../icons/CheckIcon';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/**
 * A labelled checkbox for forms and dialogs.
 *
 * Deliberately not shared with `ReminderRow`'s round completion toggle: that one marks a
 * data row done, this one sets a preference, and squashing them together would make both
 * harder to change.
 */
const Checkbox = ({ checked, onChange, label }: CheckboxProps) => (
  <Pressable
    accessibilityRole='checkbox'
    accessibilityState={{ checked }}
    accessibilityLabel={label}
    onPress={() => onChange(!checked)}
    className='flex-row items-center gap-2'
  >
    <View
      className={`h-5 w-5 items-center justify-center rounded-md border-2 ${
        checked ? 'border-brand bg-brand' : 'border-line-strong'
      }`}
    >
      {checked && <CheckIcon size={12} color='white' />}
    </View>
    <Text className='font-nunito text-[13px] text-ink-muted'>{label}</Text>
  </Pressable>
);

export default Checkbox;

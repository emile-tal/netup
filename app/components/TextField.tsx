import { Text, TextInput, View } from 'react-native';

import { colors } from '../theme';
import { forwardRef } from 'react';
import { noFocusRing } from '../utils/inputStyle';

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Draws the field in the danger colour and shows `error` beneath it. */
  invalid?: boolean;
  error?: string;
  autoFocus?: boolean;
}

/** A bordered, labelled input — for modals and forms, not the inline profile cards. */
const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, value, onChangeText, placeholder, invalid, error, autoFocus }, ref) => {
    return (
      <View className='w-full gap-1.5'>
        {label && <Text className='text-[12px] text-ink-subtle'>{label}</Text>}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSubtle}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border bg-surface-muted px-3 py-2.5 text-[15px] text-ink ${
            invalid ? 'border-danger' : 'border-line'
          }`}
          style={noFocusRing}
        />
        {invalid && error && <Text className='text-[12px] text-danger'>{error}</Text>}
      </View>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;

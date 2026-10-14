import { Pressable, Text, View } from 'react-native';

import DatePickerModal from './DatePickerModal';
import IconButton from './IconButton';
import XIcon from '../icons/XIcon';
import { colors } from '../theme';
import { formatShortDate } from '../utils/date';
import { useState } from 'react';

interface DateFieldProps {
  value?: Date;
  /** `undefined` means cleared — the field can always get back to "no date". */
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** Latest selectable day. Defaults to today (no future dates); `null` for no cap. */
  maximumDate?: Date | null;
  accessibilityLabel?: string;
  /** Heading on the picker, e.g. "When did you meet?". */
  pickerTitle?: string;
  /**
   * Offers the **x** and the picker's Clear (default). Off where a date is required — an
   * outreach is always on some day — so `onChange` then only ever receives a `Date`.
   */
  clearable?: boolean;
}

/**
 * A date input shaped like the app's other fields: the row reads as a value (or a
 * placeholder), pressing it opens `DatePickerModal`, and an **x** beside it clears the
 * date outright.
 *
 * Clearing matters as much as picking. A date entered by accident has to be removable —
 * "I haven't actually met them" is a real answer, and an empty field is how it is said.
 */
const DateField = ({
  value,
  onChange,
  placeholder = 'Select a date',
  maximumDate,
  accessibilityLabel,
  pickerTitle,
  clearable = true,
}: DateFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View className='flex-row items-center gap-1'>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={accessibilityLabel ?? placeholder}
        onPress={() => setOpen(true)}
        className='flex-1 rounded-lg bg-surface-muted px-2 py-1.5 hover:bg-grey-light'
      >
        <Text
          className={`font-nunito text-[15px] ${value ? 'text-ink' : 'text-ink-subtle'}`}
        >
          {value ? formatShortDate(value) : placeholder}
        </Text>
      </Pressable>
      {value && clearable && (
        <IconButton
          accessibilityLabel='Clear date'
          onPress={() => onChange(undefined)}
          icon={<XIcon size={14} color={colors.inkSubtle} />}
        />
      )}
      <DatePickerModal
        visible={open}
        value={value}
        maximumDate={maximumDate}
        title={pickerTitle}
        onSelect={date => {
          onChange(date);
          setOpen(false);
        }}
        onClear={
          value && clearable
            ? () => {
                onChange(undefined);
                setOpen(false);
              }
            : undefined
        }
        onRequestClose={() => setOpen(false)}
      />
    </View>
  );
};

export default DateField;

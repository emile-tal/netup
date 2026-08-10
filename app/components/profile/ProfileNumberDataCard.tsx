import { Text, TextInput, View } from 'react-native';

import CardRow from './CardRow';
import { Contact } from '../../types/contacts';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileNumberDataCardProps {
  label: string;
  value: number;
  unit: string;
  // When set (with editable), the field is bound to the contact edit store.
  fieldKey?: keyof Contact;
  editable?: boolean;
  /** Draws the value as a 1–`scale` dot meter instead of a bare number. */
  scale?: number;
}

const ProfileNumberDataCard = ({
  label,
  value,
  unit,
  fieldKey,
  editable,
  scale,
}: ProfileNumberDataCardProps) => {
  const working = useContactEditStore(s => s.workingContact);
  const updateField = useContactEditStore(s => s.updateField);
  const isEditable = editable && fieldKey;

  return (
    <CardRow label={label}>
      <View className='flex-row items-center gap-2'>
        {isEditable ? (
          <TextInput
            value={(working?.[fieldKey] as number)?.toString() ?? ''}
            onChangeText={text => updateField(fieldKey, Number(text) || 0)}
            keyboardType='number-pad'
            placeholderTextColor={colors.inkSubtle}
            className='w-16 rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
            style={noFocusRing}
          />
        ) : (
          <Text className='text-[15px] font-semibold text-ink'>{value}</Text>
        )}
        <Text className='text-[13px] text-ink-subtle'>{unit}</Text>
        {!isEditable && scale ? (
          <View className='ml-1 flex-row gap-1'>
            {Array.from({ length: scale }, (_, i) => (
              <View
                key={i}
                className={`h-1.5 w-4 rounded-full ${
                  i < value ? 'bg-brand' : 'bg-surface-sunken'
                }`}
              />
            ))}
          </View>
        ) : null}
      </View>
    </CardRow>
  );
};

export default ProfileNumberDataCard;

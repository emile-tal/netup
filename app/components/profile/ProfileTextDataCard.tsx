import { Text, TextInput } from 'react-native';

import CardRow from './CardRow';
import { Contact } from '../../types/contacts';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileDataCardProps {
  label: string;
  value: string;
  // When set (with editable), the field is bound to the contact edit store.
  fieldKey?: keyof Contact;
  editable?: boolean;
}

const ProfileDataCard = ({ label, value, fieldKey, editable }: ProfileDataCardProps) => {
  const working = useContactEditStore(s => s.workingContact);
  const updateField = useContactEditStore(s => s.updateField);
  const isEditable = editable && fieldKey;

  return (
    <CardRow label={label}>
      {isEditable ? (
        <TextInput
          value={(working?.[fieldKey] as string) ?? ''}
          onChangeText={text => updateField(fieldKey, text)}
          placeholder={label}
          placeholderTextColor={colors.inkSubtle}
          multiline
          className='rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] leading-6 text-ink'
          style={noFocusRing}
        />
      ) : (
        <Text className='text-[15px] leading-6 text-ink'>{value}</Text>
      )}
    </CardRow>
  );
};

export default ProfileDataCard;

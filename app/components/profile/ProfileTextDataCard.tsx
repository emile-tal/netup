import { Text, TextInput } from 'react-native';

import CardRow from './CardRow';
import { Contact } from '../../types/contacts';
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
          multiline
          className='text-base'
        />
      ) : (
        <Text className='text-base'>{value}</Text>
      )}
    </CardRow>
  );
};

export default ProfileDataCard;

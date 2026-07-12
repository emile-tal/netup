import { Text, TextInput, View } from 'react-native';

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
    <View className='w-full p-4 bg-white rounded-lg my-2 flex-row gap-2'>
      <View className='w-28'>
        <Text className='text-base text-gray-500'>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Text>
      </View>
      <View className='flex-1'>
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
      </View>
    </View>
  );
};

export default ProfileDataCard;

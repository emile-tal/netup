import { Text, TextInput, View } from 'react-native';

import { Contact } from '../../types/contacts';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileNumberDataCardProps {
  label: string;
  value: number;
  unit: string;
  // When set (with editable), the field is bound to the contact edit store.
  fieldKey?: keyof Contact;
  editable?: boolean;
}

const ProfileNumberDataCard = ({
  label,
  value,
  unit,
  fieldKey,
  editable,
}: ProfileNumberDataCardProps) => {
  const working = useContactEditStore(s => s.workingContact);
  const updateField = useContactEditStore(s => s.updateField);
  const isEditable = editable && fieldKey;

  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 gap-2 flex-row'>
      <View className='w-3/4'>
        <Text className='text-base text-gray-500'>{label}</Text>
      </View>
      <View className='flex-1 flex-row items-center gap-1'>
        {isEditable ? (
          <TextInput
            value={(working?.[fieldKey] as number)?.toString() ?? ''}
            onChangeText={text => updateField(fieldKey, Number(text) || 0)}
            keyboardType='number-pad'
            className='text-xl'
          />
        ) : (
          <Text className='text-xl'>{value.toString()}</Text>
        )}
        <Text className='text-base text-gray-500'>{unit}</Text>
      </View>
    </View>
  );
};

export default ProfileNumberDataCard;

import { Text, TextInput, View } from 'react-native';

import CardRow from './CardRow';
import { Phone } from '../../types/contacts';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfilePhoneCardProps {
  phone: Phone;
  editable?: boolean;
}

const ProfilePhoneCard = ({ phone, editable }: ProfilePhoneCardProps) => {
  const updateItem = useContactEditStore(s => s.updateItem);
  const removeItem = useContactEditStore(s => s.removeItem);

  if (!editable) {
    return (
      <CardRow label={phone.label}>
        <View className='flex-row items-center gap-1'>
          {phone.areaCode && <Text className='text-base'>+{phone.areaCode}</Text>}
          <Text className='text-base'>{phone.phoneNumber}</Text>
        </View>
      </CardRow>
    );
  }

  return (
    <CardRow
      label={phone.label}
      onLabelChange={label => updateItem('phones', phone.id, { label })}
      onRemove={() => removeItem('phones', phone.id)}
    >
      <View className='flex-row items-center gap-1'>
        <TextInput
          value={phone.areaCode ?? ''}
          onChangeText={value =>
            updateItem('phones', phone.id, { areaCode: value || undefined })
          }
          placeholder='+1'
          keyboardType='phone-pad'
          className='text-base w-12'
        />
        <TextInput
          value={phone.phoneNumber}
          onChangeText={value => updateItem('phones', phone.id, { phoneNumber: value })}
          placeholder='555-1234'
          keyboardType='phone-pad'
          className='text-base flex-1'
        />
      </View>
    </CardRow>
  );
};

export default ProfilePhoneCard;

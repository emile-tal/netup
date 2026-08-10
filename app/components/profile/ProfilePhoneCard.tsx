import { Text, TextInput, View } from 'react-native';

import CardRow from './CardRow';
import { Phone } from '../../types/contacts';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
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
        <Text className='text-[15px] text-ink'>
          {[phone.areaCode && `+${phone.areaCode}`, phone.phoneNumber]
            .filter(Boolean)
            .join(' ')}
        </Text>
      </CardRow>
    );
  }

  return (
    <CardRow
      label={phone.label}
      onLabelChange={label => updateItem('phones', phone.id, { label })}
      onRemove={() => removeItem('phones', phone.id)}
    >
      <View className='flex-row items-center gap-2'>
        <TextInput
          value={phone.areaCode ?? ''}
          onChangeText={value =>
            updateItem('phones', phone.id, { areaCode: value || undefined })
          }
          placeholder='+1'
          placeholderTextColor={colors.inkSubtle}
          keyboardType='phone-pad'
          className='w-14 rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
          style={noFocusRing}
        />
        <TextInput
          value={phone.phoneNumber}
          onChangeText={value => updateItem('phones', phone.id, { phoneNumber: value })}
          placeholder='555-1234'
          placeholderTextColor={colors.inkSubtle}
          keyboardType='phone-pad'
          className='flex-1 rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
          style={noFocusRing}
        />
      </View>
    </CardRow>
  );
};

export default ProfilePhoneCard;

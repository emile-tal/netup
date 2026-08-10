import { Text, TextInput, View } from 'react-native';

import { Address } from '@/app/types/contacts';
import CardRow from './CardRow';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileAddressCardProps {
  address: Address;
  editable?: boolean;
}

/** The address parts, in display order, so edit mode stays a config not a wall of JSX. */
const addressFields: { key: keyof Omit<Address, 'id' | 'label'>; placeholder: string }[] =
  [
    { key: 'street', placeholder: 'Street' },
    { key: 'city', placeholder: 'City' },
    { key: 'state', placeholder: 'State' },
    { key: 'zip', placeholder: 'ZIP' },
    { key: 'country', placeholder: 'Country' },
  ];

const ProfileAddressCard = ({ address, editable }: ProfileAddressCardProps) => {
  const updateItem = useContactEditStore(s => s.updateItem);
  const removeItem = useContactEditStore(s => s.removeItem);

  if (!editable) {
    const cityLine = [address.city, address.state, address.zip].filter(Boolean).join(' ');
    return (
      <CardRow label={address.label}>
        <View>
          {address.street ? (
            <Text className='text-[15px] leading-6 text-ink'>{address.street}</Text>
          ) : null}
          {cityLine ? (
            <Text className='text-[15px] leading-6 text-ink'>{cityLine}</Text>
          ) : null}
          {address.country ? (
            <Text className='text-[15px] leading-6 text-ink'>{address.country}</Text>
          ) : null}
        </View>
      </CardRow>
    );
  }

  return (
    <CardRow
      label={address.label}
      onLabelChange={label => updateItem('addresses', address.id, { label })}
      onRemove={() => removeItem('addresses', address.id)}
    >
      <View className='gap-1'>
        {addressFields.map(({ key, placeholder }) => (
          <TextInput
            key={key}
            value={address[key] ?? ''}
            onChangeText={value =>
              updateItem('addresses', address.id, { [key]: value || undefined })
            }
            placeholder={placeholder}
            placeholderTextColor={colors.inkSubtle}
            className='rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
            style={noFocusRing}
          />
        ))}
      </View>
    </CardRow>
  );
};

export default ProfileAddressCard;

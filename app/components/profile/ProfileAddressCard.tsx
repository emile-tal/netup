import { Text, TextInput, View } from 'react-native';

import { Address } from '@/app/types/contacts';
import CardRow from './CardRow';
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
    return (
      <CardRow label={address.label}>
        <View className='flex-col gap-0'>
          {address.street && <Text className='text-base'>{address.street}</Text>}
          <View className='flex-row gap-1'>
            {address.city && <Text className='text-base'>{address.city}</Text>}
            {address.state && <Text className='text-base'>{address.state}</Text>}
            {address.zip && <Text className='text-base'>{address.zip}</Text>}
          </View>
          {address.country && <Text className='text-base'>{address.country}</Text>}
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
      <View className='flex-col gap-0'>
        {addressFields.map(({ key, placeholder }) => (
          <TextInput
            key={key}
            value={address[key] ?? ''}
            onChangeText={value =>
              updateItem('addresses', address.id, { [key]: value || undefined })
            }
            placeholder={placeholder}
            className='text-base'
          />
        ))}
      </View>
    </CardRow>
  );
};

export default ProfileAddressCard;

import { Text, View } from 'react-native';

import { Address } from '@/app/types/contacts';

const ProfileAddressCard = ({ address }: { address: Address }) => {
  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 flex-row gap-2'>
      <View className='w-28'>
        <Text className='text-base text-gray-500'>Address</Text>
      </View>
      <View className='flex-col gap-0'>
        {address.street && <Text className='text-base'>{address.street}</Text>}
        <View className='flex-row gap-1'>
          {address.city && <Text className='text-base'>{address.city}</Text>}
          {address.state && <Text className='text-base'>{address.state}</Text>}
          {address.zip && <Text className='text-base'>{address.zip}</Text>}
        </View>
        {address.country && <Text className='text-base'>{address.country}</Text>}
      </View>
    </View>
  );
};

export default ProfileAddressCard;

import { Text, View } from 'react-native';

interface ProfilePhoneCardProps {
  label: string;
  areaCode?: string;
  phoneNumber: string;
}

const ProfilePhoneCard = ({ label, areaCode, phoneNumber }: ProfilePhoneCardProps) => {
  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 flex-row gap-2'>
      <View className='w-28'>
        <Text className='text-base text-gray-500'>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Text>
      </View>
      <View className='flex-1 flex-row items-center gap-1'>
        {areaCode && <Text className='text-base'>+{areaCode}</Text>}
        <Text className='text-base'>{phoneNumber}</Text>
      </View>
    </View>
  );
};

export default ProfilePhoneCard;

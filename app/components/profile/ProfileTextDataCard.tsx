import { Text, View } from 'react-native';

interface ProfileDataCardProps {
  label: string;
  value: string;
}

const ProfileDataCard = ({ label, value }: ProfileDataCardProps) => {
  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 flex-row gap-2'>
      <View className='w-28'>
        <Text className='text-base text-gray-500'>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Text>
      </View>
      <View className='flex-1'>
        <Text className='text-base'>{value}</Text>
      </View>
    </View>
  );
};

export default ProfileDataCard;

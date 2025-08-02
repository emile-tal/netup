import { Text, View } from 'react-native';

interface ProfileNumberDataCardProps {
  label: string;
  value: number;
  unit: string;
}

const ProfileNumberDataCard = ({ label, value, unit }: ProfileNumberDataCardProps) => {
  return (
    <View className='w-full p-4 bg-white rounded-lg my-2 gap-2 flex-row'>
      <View className='w-3/4'>
        <Text className='text-base text-gray-500'>{label}</Text>
      </View>
      <View className='flex-1 flex-row items-center gap-1'>
        <Text className='text-xl'>{value.toString()}</Text>
        <Text className='text-base text-gray-500'>{unit}</Text>
      </View>
    </View>
  );
};

export default ProfileNumberDataCard;

import { Text, TextInput, View } from 'react-native';

interface ProfileKeyDataCardProps {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  editable?: boolean;
}

const ProfileKeyDataCard = ({
  firstName,
  lastName,
  jobTitle,
  company,
  editable,
}: ProfileKeyDataCardProps) => {
  return (
    <View className='w-full p-4 bg-white rounded-lg mb-4'>
      <View className='flex-row items-center gap-4'>
        <View className='rounded-xl bg-gray-200 w-24 h-24'></View>
        <View className='flex-col'>
          {editable ? (
            <>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                className='text-xl font-bold'
              />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                className='text-xl font-bold'
              />
            </>
          ) : (
            <Text className='text-xl font-bold'>
              {firstName} {lastName}
            </Text>
          )}
          <Text className='text-base text-gray-500 italic'>{jobTitle}</Text>
          <Text className='text-base text-gray-500'>{company}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileKeyDataCard;

import { Text, TextInput, View } from 'react-native';

import { useContactEditStore } from '../../stores/contactEditStore';

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
  const working = useContactEditStore(s => s.workingContact);
  const updateField = useContactEditStore(s => s.updateField);

  return (
    <View className='w-full p-4 bg-white rounded-lg mb-4'>
      <View className='flex-row items-center gap-4'>
        <View className='rounded-xl bg-gray-200 w-24 h-24'></View>
        <View className='flex-col'>
          {editable ? (
            <>
              <TextInput
                value={working?.firstName ?? ''}
                onChangeText={text => updateField('firstName', text)}
                placeholder='First name'
                className='text-xl font-bold'
              />
              <TextInput
                value={working?.lastName ?? ''}
                onChangeText={text => updateField('lastName', text)}
                placeholder='Last name'
                className='text-xl font-bold'
              />
              <TextInput
                value={working?.jobTitle ?? ''}
                onChangeText={text => updateField('jobTitle', text)}
                placeholder='Job title'
                className='text-base text-gray-500 italic'
              />
              <TextInput
                value={working?.company ?? ''}
                onChangeText={text => updateField('company', text)}
                placeholder='Company'
                className='text-base text-gray-500'
              />
            </>
          ) : (
            <>
              <Text className='text-xl font-bold'>
                {firstName} {lastName}
              </Text>
              <Text className='text-base text-gray-500 italic'>{jobTitle}</Text>
              <Text className='text-base text-gray-500'>{company}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProfileKeyDataCard;

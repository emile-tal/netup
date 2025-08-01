import { FlatList, Text, View } from 'react-native';

import ContactLink from '../components/contacts/ContactLink';
import SearchBar from '@/app/components/SearchBar';
import { contactsData } from '@/app/placeholderData';

const Contacts = () => {
  const contacts = contactsData;

  return (
    <View className='pt-10'>
      <View className='w-full px-4 justify-center items-center'>
        <Text className='text-2xl font-bold py-2'>Contacts</Text>
        <SearchBar />
      </View>
      <FlatList
        data={contacts}
        ItemSeparatorComponent={() => <View className='h-[1px] bg-gray-200' />}
        renderItem={({ item }) => (
          <ContactLink
            firstName={item.firstName || ''}
            lastName={item.lastName}
            id={item.id}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default Contacts;

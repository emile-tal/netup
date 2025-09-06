import { FlatList, SafeAreaView, View } from 'react-native';

import SearchBar from '@/app/components/SearchBar';
import { contactsData } from '@/app/placeholderData';
import ContactLink from '../components/contacts/ContactLink';
import Header from '../components/Header';

const Contacts = () => {
  const contacts = contactsData;

  return (
    <SafeAreaView>
      <View className='px-4'>
        <Header title='Contacts' />
        <View className='pb-4'>
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
    </SafeAreaView>
  );
};

export default Contacts;

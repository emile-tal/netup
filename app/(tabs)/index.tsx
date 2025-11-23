import { ContactSummary, observeContactSummaries } from '@/db/repo/contacts';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import SearchBar from '@/app/components/SearchBar';
import { useDB } from '@/db/dbProvider';
import { resetAndSeed } from '@/db/devTools';
import ContactLink from '../components/contacts/ContactLink';
import Header from '../components/Header';

const Contacts = () => {
  const db = useDB();
  const [contacts, setContacts] = useState<ContactSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const subscription = observeContactSummaries(db).subscribe({
      next: data => {
        setContacts(data);
        console.log('Contacts loaded:', data.length);
      },
      error: error => {
        console.error('Error loading contacts:', error);
      },
    });

    return () => subscription.unsubscribe();
  }, [db]);

  const handleResetAndSeed = async () => {
    try {
      setIsLoading(true);
      await resetAndSeed(db);
      console.log('Database reset and seeded successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View className='px-4'>
        <Header title='Contacts' />
        <View className='pb-4'>
          <TouchableOpacity onPress={handleResetAndSeed} disabled={isLoading}>
            <Text className='text-blue-500'>
              {isLoading ? 'Loading...' : 'Reset and Seed Database'}
            </Text>
          </TouchableOpacity>
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

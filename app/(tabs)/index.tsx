import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { useDB } from '@/db/dbProvider';
import { resetAndSeed } from '@/db/devTools';
import { observeContactSummaries } from '@/db/repo/contacts';
import { router } from 'expo-router';
import { useEffect } from 'react';
import ContactLink from '../components/contacts/ContactLink';
import ContactSearchBar from '../components/contacts/ContactSearchBar';
import Header from '../components/Header';
import AddIcon from '../icons/AddIcon';
import useContactStore from '../stores/contactStore';

const Contacts = () => {
  const db = useDB();
  const contactSummaries = useContactStore(state => state.contactSummaries);
  const searchLoading = useContactStore(state => state.searchLoading);
  const setSearchLoading = useContactStore(state => state.setSearchLoading);
  const setContactSummaries = useContactStore(state => state.setContactSummaries);

  useEffect(() => {
    const subscription = observeContactSummaries(db).subscribe({
      next: data => {
        setContactSummaries(data);
      },
      error: error => {
        console.error('Error loading contacts:', error);
      },
    });
    return () => subscription.unsubscribe();
  }, [db]);

  const handleResetAndSeed = async () => {
    try {
      setSearchLoading(true);
      await resetAndSeed(db);
      console.log('Database reset and seeded successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View className='px-4'>
        <Header
          title='Contacts'
          actionIcon={<AddIcon />}
          onActionPress={() => router.navigate('/contacts/new')}
        />
        <View className='pb-4'>
          <TouchableOpacity onPress={handleResetAndSeed} disabled={searchLoading}>
            <Text className='text-blue-500'>
              {searchLoading ? 'Loading...' : 'Reset and Seed Database'}
            </Text>
          </TouchableOpacity>
          <ContactSearchBar />
        </View>
        <FlatList
          data={contactSummaries}
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

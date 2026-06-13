import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import AddIcon from '../icons/AddIcon';
import ContactLink from '../components/contacts/ContactLink';
import ContactSearchBar from '../components/contacts/ContactSearchBar';
import Header from '../components/Header';
import { observeContactSummaries } from '@/db/repo/contacts';
import { resetAndSeed } from '@/db/devTools';
import { router } from 'expo-router';
import useContactStore from '../stores/contactStore';
import { useDB } from '@/db/dbProvider';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Contacts = () => {
  const db = useDB();
  const contactSummaries = useContactStore(state => state.contactSummaries);
  const searchLoading = useContactStore(state => state.searchLoading);
  const setSearchLoading = useContactStore(state => state.setSearchLoading);
  const setContactSummaries = useContactStore(state => state.setContactSummaries);
  const insets = useSafeAreaInsets();

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
          onActionPress={() => router.navigate('/contacts/add')}
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
          className='min-h-full'
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Contacts;

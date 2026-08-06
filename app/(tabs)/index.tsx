import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import AddIcon from '../icons/AddIcon';
import ContactLink from '../components/contacts/ContactLink';
import ContactSearchBar from '../components/contacts/ContactSearchBar';
import Header from '../components/Header';
import ScreenLayout from '../components/ScreenLayout';
import ScreenState from '../components/ScreenState';
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
  const searchQuery = useContactStore(state => state.searchQuery);
  const searchLoading = useContactStore(state => state.searchLoading);
  const searchError = useContactStore(state => state.searchError);
  const noResults = useContactStore(state => state.noResults);
  const setSearchLoading = useContactStore(state => state.setSearchLoading);
  const setSearchError = useContactStore(state => state.setSearchError);
  const setNoResults = useContactStore(state => state.setNoResults);
  const setContactSummaries = useContactStore(state => state.setContactSummaries);
  const insets = useSafeAreaInsets();

  // The one contacts subscription in the app: re-created when the debounced search
  // query changes, so results and the unfiltered list never overwrite each other.
  useEffect(() => {
    setSearchLoading(true);
    const subscription = observeContactSummaries(db, searchQuery).subscribe({
      next: data => {
        setContactSummaries(data);
        setNoResults(data.length === 0);
        setSearchError(null);
        setSearchLoading(false);
      },
      error: (error: unknown) => {
        console.error('Error loading contacts:', error);
        setSearchError(error instanceof Error ? error : new Error(String(error)));
        setSearchLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, [
    db,
    searchQuery,
    setContactSummaries,
    setNoResults,
    setSearchError,
    setSearchLoading,
  ]);

  const handleResetAndSeed = async () => {
    try {
      setSearchLoading(true);
      await resetAndSeed(db);
    } catch (error) {
      console.error('Error resetting database:', error);
      setSearchError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setSearchLoading(false);
    }
  };

  const emptyMessage = noResults
    ? searchQuery
      ? 'No contacts match that search'
      : 'No contacts yet — add one with +'
    : undefined;

  return (
    <ScreenLayout>
      <Header
        title='Contacts'
        actionIcon={<AddIcon />}
        onActionPress={() => router.navigate('/contacts/add')}
      />
      <View className='pb-4'>
        {__DEV__ && (
          <TouchableOpacity onPress={handleResetAndSeed} disabled={searchLoading}>
            <Text className='text-blue-500'>
              {searchLoading ? 'Loading...' : 'Reset and Seed Database'}
            </Text>
          </TouchableOpacity>
        )}
        <ContactSearchBar />
      </View>
      {contactSummaries.length === 0 ? (
        <ScreenState
          loading={searchLoading}
          error={searchError}
          emptyMessage={emptyMessage}
        />
      ) : (
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
      )}
    </ScreenLayout>
  );
};

export default Contacts;

import { FlatList, View } from 'react-native';
import { useEffect, useState } from 'react';

import PersonAddIcon from '../../icons/PersonAddIcon';
import Card from '../../components/Card';
import ContactLink from '../../components/contacts/ContactLink';
import ContactSearchBar from '../../components/contacts/ContactSearchBar';
import Header from '../../components/Header';
import ImportContactsModal from '../../components/contacts/ImportContactsModal';
import ImportIcon from '../../icons/ImportIcon';
import ScreenLayout from '../../components/ScreenLayout';
import ScreenState from '../../components/ScreenState';
import { colors } from '../../theme';
import { observeContactSummaries } from '@/db/repo/contacts';
import { router } from 'expo-router';
import useContactStore from '../../stores/contactStore';
import { useDB } from '@/db/dbProvider';

const Contacts = () => {
  const db = useDB();
  const [importVisible, setImportVisible] = useState(false);
  const contactSummaries = useContactStore(state => state.contactSummaries);
  const searchQuery = useContactStore(state => state.searchQuery);
  const searchLoading = useContactStore(state => state.searchLoading);
  const searchError = useContactStore(state => state.searchError);
  const noResults = useContactStore(state => state.noResults);
  const setSearchLoading = useContactStore(state => state.setSearchLoading);
  const setSearchError = useContactStore(state => state.setSearchError);
  const setNoResults = useContactStore(state => state.setNoResults);
  const setContactSummaries = useContactStore(state => state.setContactSummaries);

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

  const count = contactSummaries.length;

  return (
    <ScreenLayout
      header={
        <>
          <Header
            title='Contacts'
            subtitle={
              count > 0 ? `${count} ${count === 1 ? 'person' : 'people'}` : undefined
            }
            actionIcon={<PersonAddIcon size={22} color='white' />}
            actionEmphasis='brand'
            actionLabel='Add contact'
            // `push`, so the form sits above the list and its X can simply pop.
            onActionPress={() => router.push('/contacts/add')}
            secondaryActionIcon={<ImportIcon size={20} color={colors.ink} />}
            secondaryActionLabel='Import contacts from CSV'
            onSecondaryActionPress={() => setImportVisible(true)}
          />
          {/* The search field belongs to the header bar, not the page: the list below it
              scrolls, and the field must not scroll away with it. */}
          <View className='pb-3'>
            <ContactSearchBar />
          </View>
        </>
      }
    >
      {count === 0 ? (
        <ScreenState
          loading={searchLoading}
          error={searchError}
          emptyMessage={
            noResults && searchQuery ? 'No matches' : noResults ? 'No contacts yet' : undefined
          }
          emptyHint={
            noResults && searchQuery
              ? 'Try a different name.'
              : noResults
                ? 'Use the add button, or import a CSV.'
                : undefined
          }
        />
      ) : (
        <Card flush className='flex-1'>
          <FlatList
            data={contactSummaries}
            ItemSeparatorComponent={() => <View className='ml-16 h-[1px] bg-line' />}
            renderItem={({ item }) => (
              <ContactLink
                firstName={item.firstName}
                lastName={item.lastName}
                jobTitle={item.jobTitle}
                company={item.company}
                id={item.id}
              />
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </Card>
      )}
      <ImportContactsModal
        visible={importVisible}
        onRequestClose={() => setImportVisible(false)}
      />
    </ScreenLayout>
  );
};

export default Contacts;

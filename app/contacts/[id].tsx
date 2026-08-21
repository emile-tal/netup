import { useLocalSearchParams, useRouter } from 'expo-router';

import ContactReminders from '../components/contacts/ContactReminders';
import EditIcon from '../icons/EditIcon';
import Header from '../components/Header';
import ProfileCard from '../components/profile/ProfileCard';
import ScreenLayout from '../components/ScreenLayout';
import ScreenState from '../components/ScreenState';
import { colors } from '../theme';
import { useContact } from '../hooks/useContact';

const ContactsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { contact, loading, error, reload } = useContact(id);

  return (
    <ScreenLayout>
      <Header
        backButton
        // Deep links and the post-save `dismissTo` can both leave this screen at the root
        // of the stack, where `back()` is a no-op — fall back to the contacts list.
        onBackPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
        actionIcon={contact ? <EditIcon size={20} color={colors.ink} /> : undefined}
        actionLabel='Edit contact'
        // `push`, so edit always sits *above* this screen for `dismissTo` to unwind to.
        onActionPress={() => router.push(`/contacts/edit/${id}`)}
      />
      {contact ? (
        <ProfileCard
          contact={contact}
          footer={<ContactReminders contactId={contact.id} />}
        />
      ) : (
        <ScreenState
          loading={loading}
          error={error}
          emptyMessage='Contact not found'
          emptyHint='It may have been deleted.'
          onRetry={reload}
        />
      )}
    </ScreenLayout>
  );
};

export default ContactsPage;

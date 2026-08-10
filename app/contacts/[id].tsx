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
        actionIcon={contact ? <EditIcon size={20} color={colors.ink} /> : undefined}
        actionLabel='Edit contact'
        onActionPress={() => router.navigate(`/contacts/edit/${id}`)}
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

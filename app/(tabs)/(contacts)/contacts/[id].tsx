import { useLocalSearchParams, useRouter } from 'expo-router';

import ContactOutreach from '../../../components/contacts/ContactOutreach';
import EditIcon from '../../../icons/EditIcon';
import Header from '../../../components/Header';
import ProfileCard from '../../../components/profile/ProfileCard';
import ScreenLayout from '../../../components/ScreenLayout';
import ScreenState from '../../../components/ScreenState';
import { colors } from '../../../theme';
import { readReturnTo } from '../../../utils/returnTo';
import { useContact } from '../../../hooks/useContact';

const ContactsPage = () => {
  const { id, returnTo } = useLocalSearchParams<{ id: string; returnTo?: string }>();
  const router = useRouter();
  const { contact, loading, error, reload } = useContact(id);
  const origin = readReturnTo(returnTo);

  const goBack = () => {
    // Opened from another tab (a tag in the calendar): unwind this stack to the list, so
    // the contacts tab isn't left parked on this profile, then return to where we came
    // from. A `back()` here could only reach the list.
    if (origin) {
      router.dismissTo('/');
      router.navigate(origin);
      return;
    }
    // Deep links and the post-save `dismissTo` can both leave this screen at the root of
    // the stack, where `back()` is a no-op — fall back to the contacts list.
    if (router.canGoBack()) router.back();
    else router.navigate('/');
  };

  return (
    <ScreenLayout
      header={
        <Header
          title='Contact'
          backButton
          onBackPress={goBack}
          actionIcon={contact ? <EditIcon size={20} color={colors.black} /> : undefined}
          actionEmphasis='brand'
          actionLabel='Edit contact'
          // `push`, so edit always sits *above* this screen for `dismissTo` to unwind to.
          // `returnTo` rides along so edit can hand it back on the way out.
          onActionPress={() =>
            router.push({
              pathname: '/contacts/edit/[id]',
              params: origin ? { id, returnTo: origin as string } : { id },
            })
          }
        />
      }
    >
      {contact ? (
        <ProfileCard
          contact={contact}
          footer={<ContactOutreach contactId={contact.id} />}
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

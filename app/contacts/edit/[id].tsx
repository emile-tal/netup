import { confirmDestructive, notify } from '../../utils/alert';
import { deleteContact, updateContact } from '@/db/repo/contacts';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Button from '../../components/Button';
import CheckIcon from '@/app/icons/CheckIcon';
import Header from '../../components/Header';
import ProfileCard from '../../components/profile/ProfileCard';
import ScreenLayout from '../../components/ScreenLayout';
import ScreenState from '../../components/ScreenState';
import XIcon from '@/app/icons/XIcon';
import { colors } from '@/app/theme';
import { useContact } from '../../hooks/useContact';
import { useContactEditStore } from '../../stores/contactEditStore';
import { useDB } from '@/db/dbProvider';

const EditContactPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const { contact, loading, error, reload } = useContact(id);
  const setWorkingContact = useContactEditStore(s => s.setWorkingContact);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) setWorkingContact(contact);
    return () => setWorkingContact(null);
  }, [contact, setWorkingContact]);

  const handleSave = async () => {
    const working = useContactEditStore.getState().workingContact;
    if (!working || saving) return;

    setSaving(true);
    try {
      await updateContact(db, id, working);
      router.navigate(`/contacts/${id}`);
    } catch (err) {
      console.error('Error saving contact:', err);
      notify('Could not save', 'Your changes were not saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    confirmDestructive({
      title: 'Delete contact',
      message: 'This removes the contact and everything attached to it.',
      onConfirm: async () => {
        try {
          await deleteContact(db, id);
          router.navigate('/');
        } catch (err) {
          console.error('Error deleting contact:', err);
          notify('Could not delete', 'The contact was not deleted.');
        }
      },
    });
  };

  return (
    <ScreenLayout>
      <Header
        title='Edit contact'
        backButton
        backIconProp={<XIcon size={20} color={colors.ink} />}
        onBackPress={() => router.navigate(`/contacts/${id}`)}
        actionIcon={<CheckIcon size={20} color='white' />}
        actionEmphasis='brand'
        actionLabel='Save changes'
        onActionPress={handleSave}
      />
      {loading || error || !contact ? (
        <ScreenState
          loading={loading}
          error={error}
          emptyMessage='Contact not found'
          onRetry={reload}
        />
      ) : (
        <ProfileCard
          contact={contact}
          editable
          footer={
            <Button label='Delete contact' variant='danger' onPress={handleDelete} />
          }
        />
      )}
    </ScreenLayout>
  );
};

export default EditContactPage;

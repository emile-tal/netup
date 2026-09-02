import { notify } from '../../utils/alert';
import { deleteContact, updateContact } from '@/db/repo/contacts';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (contact) setWorkingContact(contact);
    return () => setWorkingContact(null);
  }, [contact, setWorkingContact]);

  /**
   * Leaving edit must *pop* back to the profile, not navigate to it. `navigate` pushed a
   * second copy of `/contacts/[id]` on top of the edit screen, so the profile's back
   * button landed on edit, whose own back button returned to the profile — a loop with no
   * way out. `dismissTo` unwinds the stack to the profile already sitting under us.
   */
  const closeToContact = () => router.dismissTo(`/contacts/${id}`);

  const handleSave = async () => {
    const working = useContactEditStore.getState().workingContact;
    if (!working || saving) return;

    setSaving(true);
    try {
      await updateContact(db, id, working);
      closeToContact();
    } catch (err) {
      console.error('Error saving contact:', err);
      notify('Could not save', 'Your changes were not saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteContact(db, id);
      // Both the edit screen and the now-dead profile beneath it have to go.
      router.dismissTo('/');
    } catch (err) {
      console.error('Error deleting contact:', err);
      setConfirmingDelete(false);
      notify('Could not delete', 'The contact was not deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScreenLayout>
      <Header
        title='Edit contact'
        backButton
        backIconProp={<XIcon size={20} color={colors.ink} />}
        onBackPress={closeToContact}
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
            <Button
              label='Delete contact'
              variant='danger'
              onPress={() => setConfirmingDelete(true)}
            />
          }
        />
      )}

      <ConfirmDialog
        visible={confirmingDelete}
        title='Delete contact'
        message='This removes the contact and everything attached to it.'
        confirmLabel='Delete'
        busyLabel='Deleting…'
        destructive
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </ScreenLayout>
  );
};

export default EditContactPage;

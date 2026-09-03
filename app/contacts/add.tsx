import {
  emptyContact,
  useContactEditStore,
  withoutBlankChildren,
} from '../stores/contactEditStore';
import { useEffect, useState } from 'react';

import CheckIcon from '../icons/CheckIcon';
import Header from '../components/Header';
import ProfileCard from '../components/profile/ProfileCard';
import ScreenLayout from '../components/ScreenLayout';
import XIcon from '../icons/XIcon';
import { colors } from '../theme';
import { createContact } from '@/db/repo/contacts';
import { notify } from '../utils/alert';
import { useDB } from '@/db/dbProvider';
import { useRouter } from 'expo-router';

/**
 * New-contact form. Reuses ProfileCard in editable mode against a blank working contact,
 * so the add and edit screens stay a single set of field components.
 */
const AddContactPage = () => {
  const router = useRouter();
  const db = useDB();
  const setWorkingContact = useContactEditStore(s => s.setWorkingContact);
  const [blank] = useState(emptyContact);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWorkingContact(emptyContact());
    return () => setWorkingContact(null);
  }, [setWorkingContact]);

  const handleSave = async () => {
    const working = useContactEditStore.getState().workingContact;
    if (!working || saving) return;

    if (!working.firstName.trim() && !working.lastName.trim()) {
      notify('Name required', 'Enter a first or last name before saving.');
      return;
    }

    setSaving(true);
    try {
      const createdId = await createContact(db, withoutBlankChildren(working));
      router.replace(`/contacts/${createdId}`);
    } catch (err) {
      console.error('Error creating contact:', err);
      notify('Could not save', 'The contact was not created. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout>
      <Header
        title='New contact'
        backButton
        backIconProp={<XIcon size={20} color={colors.ink} />}
        onBackPress={() => router.back()}
        actionIcon={<CheckIcon size={20} color='white' />}
        actionEmphasis='brand'
        actionLabel='Save contact'
        onActionPress={handleSave}
      />
      <ProfileCard contact={blank} editable />
    </ScreenLayout>
  );
};

export default AddContactPage;

import { Alert, Text, TouchableOpacity } from 'react-native';
import { deleteContact, updateContact } from '@/db/repo/contacts';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import CheckIcon from '@/app/icons/CheckIcon';
import Header from '../../components/Header';
import ProfileCard from '../../components/profile/ProfileCard';
import ScreenLayout from '../../components/ScreenLayout';
import ScreenState from '../../components/ScreenState';
import XIcon from '@/app/icons/XIcon';
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
      Alert.alert('Could not save', 'Your changes were not saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete contact',
      'This removes the contact and everything attached to it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(db, id);
              router.navigate('/');
            } catch (err) {
              console.error('Error deleting contact:', err);
              Alert.alert('Could not delete', 'The contact was not deleted.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout>
      <Header
        backButton
        actionIcon={<CheckIcon />}
        onActionPress={handleSave}
        backIconProp={<XIcon />}
        onBackPress={() => router.navigate(`/contacts/${id}`)}
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
            <TouchableOpacity onPress={handleDelete} className='py-3 self-start'>
              <Text className='text-base text-red-500'>Delete contact</Text>
            </TouchableOpacity>
          }
        />
      )}
    </ScreenLayout>
  );
};

export default EditContactPage;

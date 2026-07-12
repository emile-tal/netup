import { SafeAreaView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { readContact, updateContact } from '@/db/repo/contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';

import CheckIcon from '@/app/icons/CheckIcon';
import { Contact } from '../../types/contacts';
import Header from '../../components/Header';
import ProfileCard from '../../components/profile/ProfileCard';
import XIcon from '@/app/icons/XIcon';
import { useContactEditStore } from '../../stores/contactEditStore';
import { useDB } from '@/db/dbProvider';

const ContactsPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = useDB();
  const [contact, setContact] = useState<Contact | null>(null);
  const setWorkingContact = useContactEditStore(s => s.setWorkingContact);

  useEffect(() => {
    const fetchContact = async () => {
      const contact = await readContact(db, id as string);
      if (contact) {
        setContact(contact);
        setWorkingContact(contact);
      }
    };
    fetchContact();
    return () => setWorkingContact(null);
  }, [id, db, setWorkingContact]);

  const handleSave = async () => {
    const working = useContactEditStore.getState().workingContact;
    if (working) {
      await updateContact(db, id as string, working);
    }
    router.navigate(`/contacts/${id}`);
  };

  return (
    <SafeAreaView>
      <View className='items-start justify-center px-4 mb-4'>
        <Header
          backButton
          actionIcon={<CheckIcon />}
          onActionPress={handleSave}
          backIconProp={<XIcon />}
          onBackPress={() => router.navigate(`/contacts/${id}`)}
        />
        {contact ? (
          <ProfileCard contact={contact} editable />
        ) : (
          <Text>Contact not found</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ContactsPage;

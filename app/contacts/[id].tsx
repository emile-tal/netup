import { useEffect, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import { useDB } from '@/db/dbProvider';
import { readContact } from '@/db/repo/contacts';
import { useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import ProfileCard from '../components/profile/ProfileCard';
import { Contact } from '../types/contacts';

const ContactsPage = () => {
  const { id } = useLocalSearchParams();
  const db = useDB();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      const contact = await readContact(db, id as string);
      if (contact) {
        setContact(contact);
      }
    };
    fetchContact();
  }, [id, db]);

  return (
    <SafeAreaView>
      <View className='items-start justify-center px-4 mb-4'>
        <Header backButton />
        {contact ? <ProfileCard contact={contact} /> : <Text>Contact not found</Text>}
      </View>
    </SafeAreaView>
  );
};

export default ContactsPage;

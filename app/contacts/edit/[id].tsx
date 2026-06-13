import { SafeAreaView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import CheckIcon from '@/app/icons/CheckIcon';
import { Contact } from '../../types/contacts';
import Header from '../../components/Header';
import ProfileCard from '../../components/profile/ProfileCard';
import XIcon from '@/app/icons/XIcon';
import { readContact } from '@/db/repo/contacts';
import { useDB } from '@/db/dbProvider';

const ContactsPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
        <Header
          backButton
          actionIcon={<CheckIcon />}
          onActionPress={() => router.navigate(`/contacts/edit/${id}`)}
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

import { SafeAreaView, Text, View } from 'react-native';

import Header from '../components/Header';
import ProfileCard from '../components/profile/ProfileCard';
import { contactsData } from '../placeholderData';
import { useLocalSearchParams } from 'expo-router';

const ContactsPage = () => {
  const { id } = useLocalSearchParams();

  const contact = contactsData.find(contact => contact.id === id);

  if (!contact) {
    return <Text>Contact not found</Text>;
  }

  return (
    <SafeAreaView>
      <View className='items-start justify-center px-4 mb-4'>
        <Header backButton />
        <ProfileCard contact={contact} />
      </View>
    </SafeAreaView>
  );
};

export default ContactsPage;

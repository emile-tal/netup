import { Text, View } from 'react-native';

import { contactsData } from '../placeholderData';
import { useLocalSearchParams } from 'expo-router';

const ContactsPage = () => {
  const { id } = useLocalSearchParams();

  const contact = contactsData.find(contact => contact.id === id);

  if (!contact) {
    return <Text>Contact not found</Text>;
  }

  return (
    <View>
      <Text>{contact.firstName}</Text>
    </View>
  );
};

export default ContactsPage;

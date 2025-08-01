import { Text, TouchableHighlight, View } from 'react-native';

import { Link } from 'expo-router';

interface ContactLinkProps {
  firstName: string;
  lastName: string;
  id: string;
}

const ContactLink = ({ firstName, lastName, id }: ContactLinkProps) => {
  return (
    <Link href={`/contacts/${id}`} asChild>
      <TouchableHighlight underlayColor='#e5e5e5' className='w-full'>
        <View className='w-full flex-row items-center py-3 px-4'>
          {firstName && <Text className='mr-1 text-lg'>{firstName}</Text>}
          <Text className='font-bold text-lg'>{lastName}</Text>
        </View>
      </TouchableHighlight>
    </Link>
  );
};

export default ContactLink;

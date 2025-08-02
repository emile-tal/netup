import { SafeAreaView, View } from 'react-native';

import Header from '../components/Header';
import ProfileCard from '../components/profile/ProfileCard';
import { myContactData } from '../placeholderData';

const Profile = () => {
  const contact = myContactData;
  return (
    <SafeAreaView>
      <View className='px-4'>
        <Header title='My Profile' />
        <ProfileCard contact={contact} />
      </View>
    </SafeAreaView>
  );
};

export default Profile;

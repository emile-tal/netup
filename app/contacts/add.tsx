import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddContactPage = () => {
  return (
    <SafeAreaView>
      <Header title='New Contact' backButton />
    </SafeAreaView>
  );
};

export default AddContactPage;

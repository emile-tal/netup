import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const NewContactPage = () => {
  return (
    <SafeAreaView>
      <Header title='New Contact' backButton />
    </SafeAreaView>
  );
};

export default NewContactPage;

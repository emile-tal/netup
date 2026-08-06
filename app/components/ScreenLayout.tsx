import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

/** Standard screen chrome: safe area + the horizontal padding every screen uses. */
const ScreenLayout = ({ children }: ScreenLayoutProps) => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-1 px-4'>{children}</View>
    </SafeAreaView>
  );
};

export default ScreenLayout;

import { Text, TouchableHighlight, View } from 'react-native';

import BackIcon from '../icons/BackIcon';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  backButton?: boolean;
}

const Header = ({ title, backButton }: HeaderProps) => {
  return (
    <View className='grid grid-cols-3 pt-2 pb-4'>
      {backButton && (
        <TouchableHighlight
          onPress={() => router.back()}
          underlayColor='#e5e5e5'
          className='items-center justify-center p-2 rounded-full'
        >
          <BackIcon />
        </TouchableHighlight>
      )}
      {title && <Text className='text-2xl font-bold text-center'>{title}</Text>}
    </View>
  );
};

export default Header;

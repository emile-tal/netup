import { Text, TouchableHighlight, View } from 'react-native';

import { router } from 'expo-router';
import BackIcon from '../icons/BackIcon';

interface HeaderProps {
  title?: string;
  backButton?: boolean;
  onBackPress?: () => void;
  actionIcon?: React.ReactNode;
  onActionPress?: () => void;
}

const Header = ({
  title,
  backButton,
  onBackPress,
  actionIcon,
  onActionPress,
}: HeaderProps) => {
  return (
    <View className='flex-row justify-between items-center pt-2 pb-4 px-4'>
      <View className='w-10'>
        {backButton && (
          <TouchableHighlight
            onPress={onBackPress || (() => router.back())}
            underlayColor='#e5e5e5'
            className='w-8 h-8 rounded-full items-center justify-center p-1 pr-0 pl-2'
          >
            <BackIcon />
          </TouchableHighlight>
        )}
      </View>
      <View className='flex justify-center items-center'>
        {title && <Text className='text-2xl font-bold text-center'>{title}</Text>}
      </View>
      <View className='w-10'>
        {actionIcon && (
          <TouchableHighlight
            onPress={onActionPress}
            underlayColor='#e5e5e5'
            className='w-8 h-8 rounded-full items-center justify-center p-1'
          >
            {actionIcon}
          </TouchableHighlight>
        )}
      </View>
    </View>
  );
};

export default Header;

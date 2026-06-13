import { Text, TouchableHighlight, View } from 'react-native';

import BackIcon from '../icons/BackIcon';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  backIconProp?: React.ReactNode;
  backButton?: boolean;
  onBackPress?: () => void;
  actionIcon?: React.ReactNode;
  onActionPress?: () => void;
}

const Header = ({
  title,
  backIconProp,
  backButton,
  onBackPress,
  actionIcon,
  onActionPress,
}: HeaderProps) => {
  return (
    <View className='flex-row justify-between items-center pt-2 pb-4 px-4'>
      <View className='w-[33%]'>
        {backButton && (
          <TouchableHighlight
            onPress={onBackPress || (() => router.back())}
            underlayColor='#e5e5e5'
            className='w-8 h-8 rounded-full items-center justify-center p-1 pr-0 pl-2'
          >
            {backIconProp ? backIconProp : <BackIcon />}
          </TouchableHighlight>
        )}
      </View>
      <View className='flex justify-center items-center min-w-[34%]'>
        {title && <Text className='text-2xl font-bold text-center'>{title}</Text>}
      </View>
      <View className='w-[33%] flex-row justify-end items-center'>
        {actionIcon && (
          <TouchableHighlight
            onPress={onActionPress}
            underlayColor='#e5e5e5'
            className='w-8 h-8 rounded-full items-center justify-end p-1'
          >
            {actionIcon}
          </TouchableHighlight>
        )}
      </View>
    </View>
  );
};

export default Header;

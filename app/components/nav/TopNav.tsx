import { Text, View } from 'react-native';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Logo from '../../icons/Logo';
import NavItem from './NavItem';
import { colors } from '../../theme';
import { useNavDestinations } from '../../hooks/useNavDestinations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Desktop navigation: a full-bleed white bar across the top, the wordmark on the left and
 * the destinations on the right. There is no page title anywhere — the filled destination
 * *is* the title. Its contents sit in the same centred `max-w-wide` column as every page,
 * so the wordmark lines up with the page's left edge.
 */
const TopNav = (props: BottomTabBarProps) => {
  const destinations = useNavDestinations(props);
  const insets = useSafeAreaInsets();

  return (
    <View
      className='w-full border-b border-line bg-surface'
      style={{ paddingTop: insets.top }}
    >
      <View className='min-h-[64px] w-full max-w-wide flex-row items-center gap-6 self-center px-8'>
        <View className='flex-row items-center gap-2'>
          <Logo size={28} />
          <Text className='font-nunito text-[19px] text-ink'>
            Net<Text className='font-nunito text-blue'>Up</Text>
          </Text>
        </View>
        <View className='flex-1 flex-row items-center justify-end gap-1'>
          {destinations.map(destination => (
            <NavItem
              key={destination.key}
              orientation='row'
              label={destination.label}
              focused={destination.focused}
              icon={destination.renderIcon(colors.black, 20)}
              onPress={destination.onPress}
              onLongPress={destination.onLongPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default TopNav;

import { Text, View } from 'react-native';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Logo from '../../icons/Logo';
import NavItem from './NavItem';
import { colors, layout } from '../../theme';
import { useNavDestinations } from '../../hooks/useNavDestinations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Desktop navigation: a fixed left rail with the wordmark above the destinations. */
const SideNav = (props: BottomTabBarProps) => {
  const destinations = useNavDestinations(props);
  const insets = useSafeAreaInsets();

  return (
    <View
      className='h-full border-r border-line bg-surface px-3'
      style={{
        width: layout.sideNavWidth,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className='mb-8 flex-row items-center gap-2 px-3'>
        <Logo size={28} />
        <Text className='text-[19px] font-semibold text-ink'>
          Net<Text className='text-brand'>Up</Text>
        </Text>
      </View>
      <View className='gap-1'>
        {destinations.map(destination => (
          <NavItem
            key={destination.key}
            orientation='row'
            label={destination.label}
            focused={destination.focused}
            icon={destination.renderIcon(
              destination.focused ? colors.brandDark : colors.inkMuted,
              22
            )}
            onPress={destination.onPress}
            onLongPress={destination.onLongPress}
          />
        ))}
      </View>
    </View>
  );
};

export default SideNav;

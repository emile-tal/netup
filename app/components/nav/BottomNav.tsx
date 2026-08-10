import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import NavItem from './NavItem';
import { View } from 'react-native';
import { colors } from '../../theme';
import { useNavDestinations } from '../../hooks/useNavDestinations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Mobile navigation: the standard bottom tab bar. */
const BottomNav = (props: BottomTabBarProps) => {
  const destinations = useNavDestinations(props);
  const insets = useSafeAreaInsets();

  return (
    <View
      className='flex-row border-t border-line bg-surface px-2 pt-2'
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {destinations.map(destination => (
        <NavItem
          key={destination.key}
          orientation='column'
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
  );
};

export default BottomNav;

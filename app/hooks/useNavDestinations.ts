import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';

export interface NavDestination {
  key: string;
  label: string;
  focused: boolean;
  /** Renders the route's `tabBarIcon` at the given tint. */
  renderIcon: (color: string, size: number) => React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * Flattens react-navigation's tab bar props into a plain list, so the side rail and the
 * bottom bar render the same destinations without each re-deriving them.
 */
export function useNavDestinations({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): NavDestination[] {
  return useMemo(
    () =>
      state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : (options.title ?? route.name);

        return {
          key: route.key,
          label,
          focused,
          renderIcon: (color: string, size: number) =>
            options.tabBarIcon?.({ focused, color, size }) ?? null,
          onPress: () => {
            // The canonical tab press flow: let listeners cancel, otherwise navigate
            // without pushing a duplicate entry for the already-focused tab.
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          },
          onLongPress: () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          },
        };
      }),
    [state, descriptors, navigation]
  );
}

import CalendarIcon from '../icons/CalendarIcon';
import ContactsIcon from '../icons/ContactsIcon';
import NavBar from '../components/nav/NavBar';
import NetworkIcon from '../icons/NetworkIcon';
import PersonIcon from '../icons/PersonIcon';
import { StatusBar } from 'expo-status-bar';
import { TAB_TITLES } from '../utils/tabs';
import { Tabs } from 'expo-router';
import type { IconProps } from '../icons/types';
import { colors } from '../theme';
import { useIsDesktop } from '../hooks/useLayoutMode';
import { useOutreachRepair } from '../hooks/useOutreachRepair';

/** react-navigation hands `tabBarIcon` a tint and size; our icons take exactly those. */
const tabIcon = (Icon: (props: IconProps) => React.ReactElement) => {
  const TabIcon = ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
  TabIcon.displayName = 'TabIcon';
  return TabIcon;
};

// The contacts stack is the app's landing tab; naming it explicitly keeps that from
// depending on how the route files happen to sort.
export const unstable_settings = { initialRouteName: '(contacts)' };

const Layout = () => {
  const isDesktop = useIsDesktop();
  // The tab layout mounts once for the life of the app, so this is where the 5-15-50
  // schedule gets its one launch-time repair pass.
  useOutreachRepair();

  return (
    <>
      <StatusBar style='dark' />
      <Tabs
        // NavBar renders the top bar or the bottom bar; tabBarPosition tells the navigator
        // which edge to lay it out on, so both must read the same hook.
        tabBar={props => <NavBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: isDesktop ? 'top' : 'bottom',
          sceneStyle: { backgroundColor: colors.surfaceMuted },
        }}
      >
        {/* A *group*, not a screen: the contacts tab is a nested stack (list → profile →
            add/edit) so all four render inside the tab region, exactly where the list
            does. The parens keep the group out of the URL, so the list is still `/`. */}
        <Tabs.Screen
          name='(contacts)'
          options={{ title: TAB_TITLES.contacts, tabBarIcon: tabIcon(ContactsIcon) }}
        />
        <Tabs.Screen
          name='calendar'
          options={{ title: TAB_TITLES.calendar, tabBarIcon: tabIcon(CalendarIcon) }}
        />
        <Tabs.Screen
          name='network'
          options={{ title: TAB_TITLES.network, tabBarIcon: tabIcon(NetworkIcon) }}
        />
        <Tabs.Screen
          name='profile'
          options={{ title: TAB_TITLES.profile, tabBarIcon: tabIcon(PersonIcon) }}
        />
      </Tabs>
    </>
  );
};

export default Layout;

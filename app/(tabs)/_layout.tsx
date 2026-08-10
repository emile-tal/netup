import AgendaIcon from '../icons/AgendaIcon';
import CalendarIcon from '../icons/CalendarIcon';
import ContactsIcon from '../icons/ContactsIcon';
import NavBar from '../components/nav/NavBar';
import ProfileIcon from '../icons/ProfileIcon';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router';
import type { IconProps } from '../icons/types';
import { colors } from '../theme';
import { useIsWideLayout } from '../hooks/useIsWideLayout';

/** react-navigation hands `tabBarIcon` a tint and size; our icons take exactly those. */
const tabIcon = (Icon: (props: IconProps) => React.ReactElement) => {
  const TabIcon = ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
  TabIcon.displayName = 'TabIcon';
  return TabIcon;
};

const Layout = () => {
  const isWide = useIsWideLayout();

  return (
    <>
      <StatusBar style='dark' />
      <Tabs
        // NavBar renders the rail or the bar; tabBarPosition tells the navigator which
        // axis to lay it out on, so both must read the same breakpoint.
        tabBar={props => <NavBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: isWide ? 'left' : 'bottom',
          sceneStyle: { backgroundColor: colors.surfaceMuted },
        }}
      >
        <Tabs.Screen
          name='index'
          options={{ title: 'Contacts', tabBarIcon: tabIcon(ContactsIcon) }}
        />
        <Tabs.Screen
          name='calendar'
          options={{ title: 'Calendar', tabBarIcon: tabIcon(CalendarIcon) }}
        />
        <Tabs.Screen
          name='agenda'
          options={{ title: 'Agenda', tabBarIcon: tabIcon(AgendaIcon) }}
        />
        <Tabs.Screen
          name='profile'
          options={{ title: 'Profile', tabBarIcon: tabIcon(ProfileIcon) }}
        />
      </Tabs>
    </>
  );
};

export default Layout;

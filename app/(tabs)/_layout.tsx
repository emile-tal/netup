import CalendarIcon from '../icons/CalendarIcon';
import ContactsIcon from '../icons/ContactsIcon';
import ProfileIcon from '../icons/ProfileIcon';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router';

const Layout = () => {
  return (
    <>
      <StatusBar style='dark' />
      <Tabs
        screenOptions={{
          tabBarStyle: { paddingTop: 8, paddingBottom: 8 },
          tabBarItemStyle: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          },
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Contacts',
            headerShown: false,
            tabBarIcon: () => <ContactsIcon />,
          }}
        />
        <Tabs.Screen
          name='calendar'
          options={{
            title: 'Calendar',
            headerShown: false,
            tabBarIcon: () => <CalendarIcon />,
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: () => <ProfileIcon />,
          }}
        />
      </Tabs>
    </>
  );
};

export default Layout;

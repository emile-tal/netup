import { Tabs } from 'expo-router';

const Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name='index' options={{ title: 'Contacts', headerShown: false }} />
      <Tabs.Screen name='calendar' options={{ title: 'Calendar', headerShown: false }} />
      <Tabs.Screen name='profile' options={{ title: 'Profile', headerShown: false }} />
    </Tabs>
  );
};

export default Layout;

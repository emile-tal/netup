import { Text, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import ScreenLayout from '../components/ScreenLayout';
import { confirmDestructive, notify } from '../utils/alert';
import { useAuth } from '@/lib/auth/AuthProvider';

const SettingsScreen = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    confirmDestructive({
      title: 'Sign out?',
      message: 'Your contacts stay on this device and will be here when you sign back in.',
      confirmLabel: 'Sign out',
      onConfirm: async () => {
        try {
          await signOut();
        } catch (e) {
          notify('Could not sign out', e instanceof Error ? e.message : undefined);
        }
      },
    });
  };

  return (
    <ScreenLayout>
      <Header title='Settings' />

      <View className='gap-4'>
        <Card className='gap-3'>
          <Text className='text-[12px] text-ink-subtle'>Signed in as</Text>
          <Text className='text-[16px] font-semibold text-ink'>{user?.email}</Text>
        </Card>

        <Button label='Sign out' variant='danger' onPress={handleSignOut} fullWidth />
      </View>
    </ScreenLayout>
  );
};

export default SettingsScreen;

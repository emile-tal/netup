import { Text, View } from 'react-native';

import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import Header from '../components/Header';
import ScreenLayout from '../components/ScreenLayout';
import { notify } from '../utils/alert';
import { formatTimeAgo } from '../utils/date';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useState } from 'react';
import useSyncStore from '../stores/syncStore';

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const status = useSyncStore(s => s.status);
  const pendingCount = useSyncStore(s => s.pendingCount);
  const lastSyncedAt = useSyncStore(s => s.lastSyncedAt);
  const syncError = useSyncStore(s => s.error);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Pending is the honest headline: it is the number of local changes the server has not
  // accepted yet, so it is what tells the user whether it is safe to close the app.
  const syncLine =
    status === 'syncing'
      ? 'Syncing…'
      : pendingCount > 0
        ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} waiting to upload`
        : lastSyncedAt
          ? `Up to date · synced ${formatTimeAgo(lastSyncedAt)}`
          : 'Waiting for first sync';

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      // No dismiss on success: the session change swaps the navigator out from under
      // this screen, so the dialog goes with it.
    } catch (e) {
      setConfirmingSignOut(false);
      notify('Could not sign out', e instanceof Error ? e.message : undefined);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScreenLayout>
      <Header title='Settings' />

      <View className='gap-4'>
        <Card className='gap-3'>
          <Text className='text-[12px] text-ink-subtle'>Signed in as</Text>
          <Text className='text-[16px] font-semibold text-ink'>{user?.email}</Text>
        </Card>

        <Card className='gap-2'>
          <Text className='text-[12px] text-ink-subtle'>Sync</Text>
          <Text className='text-[15px] text-ink'>{syncLine}</Text>
          {syncError && (
            <Text className='text-[13px] leading-5 text-danger'>
              Last attempt failed: {syncError.message}
            </Text>
          )}
        </Card>

        <Button
          label='Sign out'
          variant='danger'
          onPress={() => setConfirmingSignOut(true)}
          fullWidth
        />
      </View>

      <ConfirmDialog
        visible={confirmingSignOut}
        title='Sign out?'
        message='Your contacts stay on this device and will be here when you sign back in.'
        confirmLabel='Sign out'
        busyLabel='Signing out…'
        destructive
        busy={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </ScreenLayout>
  );
};

export default SettingsScreen;

import { Text, View } from 'react-native';

import AccountRow from '../components/account/AccountRow';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Card from '../components/Card';
import ChangePasswordModal from '../components/account/ChangePasswordModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EditNameModal from '../components/account/EditNameModal';
import ScreenLayout from '../components/ScreenLayout';
import { notify } from '../utils/alert';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useProfile } from '../providers/ProfileProvider';
import { useState } from 'react';

type Dialog = 'name' | 'password' | 'signOut' | null;

/**
 * The signed-in user's own page: who they are, and the three things they can do about it —
 * rename, change password, sign out. Sync status deliberately isn't shown; it is the
 * app's business, not the user's (`syncStore` still tracks it).
 */
const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [signingOut, setSigningOut] = useState(false);
  const name = profile?.displayName ?? '';
  // `Avatar` wants a first and last name; a display name is one string.
  const [firstName, ...rest] = name.trim().split(/\s+/);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      // No dismiss on success: the session change swaps the navigator out from under
      // this screen, so the dialog goes with it.
    } catch (e) {
      setDialog(null);
      notify('Could not sign out', e instanceof Error ? e.message : undefined);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScreenLayout>
      <View className='gap-4'>
        <View className='flex-row items-center gap-4 py-2'>
          <Avatar firstName={firstName} lastName={rest.join(' ')} size={64} />
          <View className='flex-1'>
            <Text numberOfLines={1} className='font-nunito text-[26px] tracking-tight text-ink'>
              {name}
            </Text>
            <Text numberOfLines={1} className='font-nunito text-[14px] text-ink-muted'>
              {user?.email}
            </Text>
          </View>
        </View>

        <Card flush>
          <AccountRow
            label='Name'
            value={name}
            accessibilityLabel='Change your name'
            onPress={() => setDialog('name')}
          />
          <View className='ml-4 h-[1px] bg-line' />
          <AccountRow label='Email' value={user?.email ?? ''} />
          <View className='ml-4 h-[1px] bg-line' />
          <AccountRow
            label='Password'
            value='••••••••••'
            accessibilityLabel='Change your password'
            onPress={() => setDialog('password')}
          />
        </Card>

        <Button
          label='Sign out'
          variant='destructive'
          onPress={() => setDialog('signOut')}
          fullWidth
        />
      </View>

      <EditNameModal
        visible={dialog === 'name'}
        name={name}
        onRequestClose={() => setDialog(null)}
      />
      <ChangePasswordModal
        visible={dialog === 'password'}
        onRequestClose={() => setDialog(null)}
      />
      <ConfirmDialog
        visible={dialog === 'signOut'}
        title='Sign out?'
        message='Your contacts stay on this device and will be here when you sign back in.'
        confirmLabel='Sign out'
        busyLabel='Signing out…'
        destructive
        busy={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setDialog(null)}
      />
    </ScreenLayout>
  );
};

export default ProfileScreen;

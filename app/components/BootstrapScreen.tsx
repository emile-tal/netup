import { Text, View } from 'react-native';

import Button from './Button';
import Card from './Card';
import Logo from '../icons/Logo';
import ScreenLayout from './ScreenLayout';

interface BootstrapScreenProps {
  /** Shown small, under the explanation. The headline is never a raw error. */
  error?: Error | null;
  onRetry: () => void;
  onSignOut: () => void;
}

/**
 * Shown when this device has not managed to download the account yet.
 *
 * Deliberately not `ScreenState`'s error branch, which puts `error.message` in the body —
 * this is a blocking, first-impression screen, so the explanation is written for a person
 * and the technical detail is demoted to a footnote.
 *
 * The wording covers a brand-new sign-up too, which has nothing to download but still
 * needs the round trip to finish setting up.
 */
const BootstrapScreen = ({ error, onRetry, onSignOut }: BootstrapScreenProps) => (
  <ScreenLayout>
    <View className='flex-1 items-center justify-center gap-6'>
      <Logo size={48} />

      <Card className='gap-3'>
        <Text className='text-[20px] font-bold text-ink'>
          We can&apos;t reach netup right now
        </Text>
        <Text className='text-[15px] leading-6 text-ink-muted'>
          This device hasn&apos;t finished setting up your account yet, so there&apos;s
          nothing here to show you. Connect to the internet and try again.
        </Text>
        <Text className='text-[15px] leading-6 text-ink-muted'>
          It only needs to work once. After that netup runs entirely on your device — you
          can add people and reminders with no signal at all.
        </Text>
        {error && (
          <Text className='text-[12px] leading-4 text-ink-subtle'>{error.message}</Text>
        )}

        <View className='mt-2 gap-2'>
          {/* Tapping this returns the gate to its loading state, so the screen is
              replaced rather than showing a busy label in place. */}
          <Button label='Try again' onPress={onRetry} fullWidth />
          <Button label='Sign out' variant='ghost' onPress={onSignOut} fullWidth />
        </View>
      </Card>
    </View>
  </ScreenLayout>
);

export default BootstrapScreen;

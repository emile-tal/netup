import { Text, View } from 'react-native';

import Button from './Button';
import type { ErrorBoundaryProps } from 'expo-router';
import Logo from '../icons/Logo';

/**
 * The root layout's `ErrorBoundary`: what renders when a screen throws while rendering,
 * instead of a blank window.
 *
 * Self-contained on purpose. It replaces the root layout, so none of that layout's
 * providers (safe area, auth, database, fonts) can be assumed — `ScreenLayout` would
 * itself throw here. Nothing has been lost: the data is in the local database, and
 * `retry` re-renders the tree.
 */
const CrashScreen = ({ error, retry }: ErrorBoundaryProps) => (
  <View className='flex-1 items-center justify-center bg-surface-muted p-6'>
    <View className='w-full max-w-[420px] items-center gap-4'>
      <Logo size={40} />
      <Text className='font-nunito text-center text-[22px] text-ink'>
        Something went wrong
      </Text>
      <Text className='font-nunito text-center text-[15px] leading-6 text-ink-muted'>
        This screen hit a problem it couldn&apos;t recover from. Your contacts and outreach
        are safe on this device.
      </Text>
      <Text className='font-nunito text-center text-[12px] leading-4 text-ink-subtle'>
        {error.message}
      </Text>
      <View className='mt-2 w-full max-w-[280px]'>
        <Button label='Try again' onPress={() => void retry()} fullWidth />
      </View>
    </View>
  </View>
);

export default CrashScreen;

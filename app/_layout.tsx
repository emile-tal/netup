import '@/app/globals.css';

import { DBRootProvider } from '@/db/dbProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/app/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DBRootProvider>
        <Stack
          // Every screen draws its own header via `components/Header`, so the native one
          // stays off throughout.
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.surfaceMuted },
          }}
        >
          <Stack.Screen name='(tabs)' />
          <Stack.Screen name='contacts/[id]' />
          <Stack.Screen name='contacts/add' />
          <Stack.Screen name='contacts/edit/[id]' />
        </Stack>
      </DBRootProvider>
    </SafeAreaProvider>
  );
}

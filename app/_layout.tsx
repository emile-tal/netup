import '@/app/globals.css';

import { DBRootProvider } from '@/db/dbProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DBRootProvider>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='contacts/[id]' options={{ headerShown: false }} />
          <Stack.Screen name='contacts/add' options={{ headerShown: false }} />
          <Stack.Screen name='contacts/edit/[id]' options={{ headerShown: false }} />
        </Stack>
      </DBRootProvider>
    </SafeAreaProvider>
  );
}

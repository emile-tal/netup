import '@/app/globals.css';

import { DBRootProvider } from '@/db/dbProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/app/theme';

export default function RootLayout() {
  return (
    // Required by the 5-15-50 board's drag gestures on native (see
    // components/network/DraggableChip). A no-op wrapper on web.
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}

import '@/app/globals.css';
// Must load before the Supabase client: supabase-js needs a spec-compliant URL, and
// React Native's built-in one is not.
import 'react-native-url-polyfill/auto';

import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';

import { DBRootProvider } from '@/db/dbProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenState from '@/app/components/ScreenState';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { colors } from '@/app/theme';
import { useSync } from '@/app/hooks/useSync';

/**
 * Hosts the sync loop. It sits inside DBRootProvider (it reads the database) and above
 * every route, because `app/contacts/*` are Stack routes outside `(tabs)` — mounting the
 * loop in the tab layout would stop it while the user edits a contact, which is exactly
 * when writes happen. It is a no-op while signed out.
 */
const SyncHost = ({ children }: { children: React.ReactNode }) => {
  useSync();
  return <>{children}</>;
};

const RootNavigator = () => {
  const { session, loading } = useAuth();

  // Hold the shell until the persisted session has been read back, so a returning user
  // never sees the sign-in screen flash past.
  if (loading) {
    return (
      <View className='flex-1 bg-surface-muted'>
        <ScreenState loading />
      </View>
    );
  }

  return (
    // Keyed on the account so switching users tears down every screen's state along with
    // the database it was reading.
    <DBRootProvider
      key={session?.user.id ?? 'signed-out'}
      userId={session?.user.id ?? null}
    >
      <SyncHost>
        <Stack
          // Every screen draws its own header via `components/Header`, so the native one
          // stays off throughout.
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.surfaceMuted },
          }}
        >
          {/* The guards, not a redirect effect, are what keep a signed-out user out of
              the app: an unguarded screen can render (and call `useDB`) for a frame
              before an effect gets the chance to redirect. */}
          <Stack.Protected guard={!session}>
            <Stack.Screen name='(auth)' />
          </Stack.Protected>

          {/* Unguarded on purpose: following a reset link creates a real session, so a
              screen gated on "signed out" would be unreachable exactly when it is
              needed. See app/reset-password.tsx. */}
          <Stack.Screen name='reset-password' />

          <Stack.Protected guard={!!session}>
            <Stack.Screen name='(tabs)' />
            <Stack.Screen name='contacts/[id]' />
            <Stack.Screen name='contacts/add' />
            <Stack.Screen name='contacts/edit/[id]' />
          </Stack.Protected>
        </Stack>
      </SyncHost>
    </DBRootProvider>
  );
};

export default function RootLayout() {
  return (
    // Required by the 5-15-50 board's drag gestures on native (see
    // components/network/DraggableChip). A no-op wrapper on web.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

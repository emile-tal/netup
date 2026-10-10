import '@/app/globals.css';
// Must load before the Supabase client: supabase-js needs a spec-compliant URL, and
// React Native's built-in one is not.
import 'react-native-url-polyfill/auto';

import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';

import BootstrapScreen from '@/app/components/BootstrapScreen';
import { DBRootProvider } from '@/db/dbProvider';
import FullScreenLoader from '@/app/components/FullScreenLoader';
import { ProfileProvider, useProfile } from '@/app/providers/ProfileProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors } from '@/app/theme';
import { useHydration } from '@/app/hooks/useHydration';
import { useSync } from '@/app/hooks/useSync';

/**
 * Hosts the sync loop. It sits inside DBRootProvider (it reads the database) and above
 * every route, so it keeps running whatever the user is looking at — including the
 * contact edit form, which is exactly when writes happen. It is a no-op while signed out.
 */
const SyncHost = ({ children }: { children: React.ReactNode }) => {
  useSync();
  return <>{children}</>;
};


/**
 * Decides what the signed-in user actually sees, in three steps.
 *
 * 1. **Has this device downloaded the account?** An existing account cannot be used on a
 *    new device until it has, so a failure here is a blocking screen rather than an empty
 *    app (see `useHydration`). Once done it is durable: offline launches skip straight past.
 * 2. **Has the user been through first-run setup?** The `(onboarding)` group collects
 *    their name. It sits between the app group and `(auth)` because a guard flip falls
 *    back to the first *available* screen — finishing onboarding must find `(tabs)` above
 *    it, and signing out must find `(auth)` below it.
 * 3. Otherwise, the app.
 *
 * The first two states are early returns rather than route groups on purpose: neither is a
 * destination, neither has back behaviour, and rendering above the router is what stops
 * any route — including unguarded `reset-password` — from mounting and calling `useDB()`
 * against data that is not there yet.
 */
const RootStack = () => {
  const { session, signOut } = useAuth();
  const { state, error, retry } = useHydration(session?.user.id ?? null);
  const { profile, loading: profileLoading } = useProfile();

  if (session) {
    if (state === 'checking' || state === 'hydrating') return <FullScreenLoader />;
    if (state === 'failed') {
      return (
        <BootstrapScreen
          error={error}
          onRetry={retry}
          onSignOut={() => void signOut()}
        />
      );
    }
    // Hold rather than guess: rendering before the first emission would flash the
    // onboarding flow at a user who finished it months ago.
    if (profileLoading) return <FullScreenLoader />;
  }

  const onboarded = !!profile?.onboardedAt;

  return (
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
          before an effect gets the chance to redirect.

          Declaration order is load-bearing. When a guard flips, expo-router falls
          back to the first *available* screen — so the app group has to come first,
          or signing in would land on `reset-password` (which is unguarded) instead
          of the contacts list. */}
      <Stack.Protected guard={!!session && onboarded}>
        {/* The whole app, tabs and all: the contact profile/add/edit screens are a stack
            nested inside the contacts tab, so they are not declared here. */}
        <Stack.Screen name='(tabs)' />
      </Stack.Protected>

      <Stack.Protected guard={!!session && !onboarded}>
        <Stack.Screen name='(onboarding)' />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name='(auth)' />
      </Stack.Protected>

      {/* Unguarded on purpose: following a reset link creates a real session, so a
          screen gated on "signed out" would be unreachable exactly when it is
          needed. Last, so it is never the fallback. See app/reset-password.tsx. */}
      <Stack.Screen name='reset-password' />
    </Stack>
  );
};

const RootNavigator = () => {
  const { session, loading } = useAuth();

  // The guards below decide *what renders*; this only fixes *the address bar*. When the
  // app group unmounts, the router's fallback within `(auth)` is not `sign-in`, so a
  // sign-out left `/forgot-password` in the URL while rendering the sign-in screen — and
  // a reload would then strand the user there.
  const hadSession = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (session) hadSession.current = true;
    else if (hadSession.current) {
      hadSession.current = false;
      router.replace('/sign-in');
    }
  }, [session, loading]);

  // Hold the shell until the persisted session has been read back, so a returning user
  // never sees the sign-in screen flash past.
  if (loading) return <FullScreenLoader />;

  return (
    // Keyed on the account so switching users tears down every screen's state along with
    // the database it was reading.
    <DBRootProvider
      key={session?.user.id ?? 'signed-out'}
      userId={session?.user.id ?? null}
    >
      <SyncHost>
        <ProfileProvider>
          <RootStack />
        </ProfileProvider>
      </SyncHost>
    </DBRootProvider>
  );
};

export default function RootLayout() {
  // Two faces, no bold — emphasis is size and colour, never weight (see FRONTEND.md).
  // The keys are the family names `tailwind.config.js` exposes as `font-nunito` and
  // `font-nunito-medium`; React Native will not synthesise a weight for a custom family,
  // so each one has to be loaded separately.
  const [fontsLoaded] = useFonts({
    Nunito: require('../assets/fonts/nunito/static/Nunito-Regular.ttf'),
    NunitoMedium: require('../assets/fonts/nunito/static/Nunito-Medium.ttf'),
  });

  // Hold the whole app rather than let it paint in the system font and reflow — the type
  // is the first thing you see, and the swap is very visible at display sizes.
  if (!fontsLoaded) return <FullScreenLoader />;

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

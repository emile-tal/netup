import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

/**
 * Without this the group's anchor is whichever file sorts first — `forgot-password` — so
 * signing out put that in the address bar while rendering sign-in, and a reload would
 * strand the user on the wrong screen.
 */
export const unstable_settings = { initialRouteName: 'sign-in' };

/** The signed-out stack. Every screen draws its own chrome, so no native header. */
const AuthLayout = () => (
  <>
    <StatusBar style='dark' />
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surfaceMuted },
      }}
    />
  </>
);

export default AuthLayout;

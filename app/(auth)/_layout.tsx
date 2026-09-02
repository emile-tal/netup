import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

/** The signed-out stack. Both screens draw their own chrome, so no native header. */
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

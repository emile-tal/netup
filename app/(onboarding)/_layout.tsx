import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

/**
 * Without this the group's anchor is whichever file sorts first — `welcome` — so entering
 * the flow would put that in the address bar while rendering the name screen, and a
 * reload would land on the quote with no name to save.
 */
export const unstable_settings = { initialRouteName: 'name' };

/** First-run setup. Two full pages, each drawing its own chrome. */
const OnboardingLayout = () => (
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

export default OnboardingLayout;

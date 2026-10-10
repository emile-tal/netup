import { Stack } from 'expo-router';

import { colors } from '../../theme';

/**
 * The contacts tab: the list at its root, with the profile, add and edit screens pushed
 * on top of it. Nesting them *inside* the tabs group is what makes a contact open where
 * the list renders — the nav (bottom bar or side rail) stays put and the form replaces
 * the list rather than covering the whole window.
 *
 * It is still a Stack, so the push transition and the `dismissTo` unwinding described in
 * CLAUDE.md §10 are unchanged — only the region it draws into is. The group's parens keep
 * it out of the URL: the list is `/`, a contact is `/contacts/<id>`.
 */
// Without this the stack's anchor is whichever route sorts first — `contacts/[id]` —
// which is the same trap `(auth)` hit (§15). The list is the root of this stack.
export const unstable_settings = { initialRouteName: 'index' };

const ContactsStackLayout = () => (
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.surfaceMuted },
    }}
  />
);

export default ContactsStackLayout;

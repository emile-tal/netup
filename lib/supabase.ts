import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Native Supabase client. The web build resolves `supabase.web.ts` instead — keep the
 * exported signature identical. See CLAUDE.md §12 for the platform-suffix convention.
 *
 * The API URL is derived from the project id, so there is no third env var to keep in
 * sync with the other two.
 */
const projectId = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!projectId || !publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_PROJECT_ID or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy .env.example to .env and fill both in.'
  );
}

export const supabase = createClient(`https://${projectId}.supabase.co`, publishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No browser URL to read a session back out of on native.
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

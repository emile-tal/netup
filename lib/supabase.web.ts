import { createClient } from '@supabase/supabase-js';

/**
 * Web Supabase client. Mirrors `supabase.ts`, with two differences: the session lives in
 * localStorage (supabase-js's default, so no `storage` override), and `detectSessionInUrl`
 * is on so an email-confirmation or recovery redirect can hand its token back.
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
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

/**
 * Native only. A password-reset link opens the app at `netup://reset-password?code=...`;
 * because `detectSessionInUrl` is off on native there is no browser URL for supabase-js
 * to read, so the code has to be exchanged for a session by hand.
 *
 * The web build resolves the `.web.ts` no-op, where `detectSessionInUrl: true` already
 * does this and strips the code from the address bar.
 */
export function useAuthDeepLink() {
  useEffect(() => {
    const handle = async (url: string | null) => {
      if (!url) return;
      const code = Linking.parse(url).queryParams?.code;
      if (typeof code !== 'string') return;

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) console.error('Auth deep link exchange failed:', error.message);
    };

    // Cold start (the app was not running when the link was tapped) and warm start.
    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', ({ url }) => void handle(url));
    return () => sub.remove();
  }, []);
}

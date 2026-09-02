import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export interface SignUpResult {
  /**
   * True when Supabase accepted the sign-up but withheld a session pending email
   * confirmation. The screen branches on this rather than on a build-time flag, so the
   * project's "Confirm email" toggle can be flipped without a code change.
   */
  needsConfirmation: boolean;
}

interface AuthValue {
  session: Session | null;
  user: User | null;
  /** True until the persisted session has been read back from storage. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Read the persisted session first so a returning user never sees the sign-in screen
    // flash, then hand over to the listener for refreshes, sign-outs and other tabs.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      },

      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        // With email-enumeration protection on, signing up with an address that already
        // exists succeeds but returns a user with no identities. Surfacing that as an
        // error is the honest outcome; it leaks nothing an attacker can act on, because
        // Supabase has already sent the real owner a notice rather than a signup link.
        if (data.user && data.user.identities?.length === 0) {
          throw new Error('An account with that email already exists. Try signing in.');
        }

        return { needsConfirmation: data.session === null };
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth used outside AuthProvider');
  return value;
}

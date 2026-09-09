import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { Profile } from '@/app/types/profile';
import { observeProfile } from '@/db/repo/profile';
import { useOptionalDB } from '@/db/dbProvider';

interface ProfileValue {
  /** The signed-in user's own record, or null before onboarding. */
  profile: Profile | null;
  /** True until the first emission, so the gate never guesses "not onboarded". */
  loading: boolean;
}

const ProfileContext = createContext<ProfileValue | null>(null);

/**
 * Holds the app's single subscription to the profile row (CLAUDE.md §6).
 *
 * Mounted inside `DBRootProvider` so it can read the per-account database, and above every
 * route so the root layout's guards can read it. Inert while signed out.
 */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const db = useOptionalDB();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const subscription = observeProfile(db).subscribe({
      next: row => {
        setProfile(row);
        setLoading(false);
      },
      error: (cause: unknown) => {
        console.error('Error reading the profile:', cause);
        // Failing open: a read error must not lock the user out of their own app. The
        // worst case is the first-run flow appearing again, which is recoverable.
        setProfile(null);
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db]);

  const value = useMemo(() => ({ profile, loading }), [profile, loading]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile used outside ProfileProvider');
  return value;
}

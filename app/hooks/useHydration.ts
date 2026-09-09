import { useCallback, useEffect, useRef, useState } from 'react';

import { markHydrated, readHydrated } from '@/db/sync/cursor';
import { runSync } from '@/db/sync/engine';
import { useOptionalDB } from '@/db/dbProvider';

export type HydrationState = 'checking' | 'hydrating' | 'failed' | 'hydrated';

/**
 * Whether this device has downloaded the account yet.
 *
 * netup is offline-first, but that promise only starts once: an existing account cannot be
 * *used* on a new device until its data has arrived, because the alternative is showing
 * someone an empty app that looks exactly like data loss. After one successful pull the
 * flag is durable and no network is ever required again on this device — which is what
 * lets a user add a reminder on a plane.
 *
 * The state lives here rather than being inferred from `syncStore`, whose `status` starts
 * at `'idle'` and returns to `'idle'` on success: indistinguishable from "never ran".
 * Owning the promise makes "still going" and "gave up" unambiguous.
 */
export function useHydration(userId: string | null) {
  // Optional, not `useDB`: this runs above the route guards.
  const db = useOptionalDB();
  const [state, setState] = useState<HydrationState>('checking');
  const [error, setError] = useState<Error | null>(null);
  // Bumping this re-runs the effect below, which is what Retry does.
  const [attempt, setAttempt] = useState(0);

  // Stops a pass that outlives a sign-out from writing into an unmounted tree.
  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!db || !userId) {
      // Signed out: nothing to download, and the auth guard owns the screen.
      setState('hydrated');
      return;
    }

    let cancelled = false;
    const settle = (next: HydrationState, cause: Error | null = null) => {
      if (cancelled || !activeRef.current) return;
      setError(cause);
      setState(next);
    };

    setState('checking');
    setError(null);

    void (async () => {
      if (await readHydrated(userId)) {
        settle('hydrated');
        return;
      }

      settle('hydrating');
      try {
        // `runSync` de-dupes in-flight passes, so this joins the one `useSync` fires on
        // sign-in rather than racing it — and, once that has settled, Retry starts a
        // genuinely new pass.
        await runSync(db, userId);
        // `pullChanges` sets the flag itself; this covers the case where the pass was
        // already in flight and had written it before we joined.
        await markHydrated(userId);
        settle('hydrated');
      } catch (cause) {
        console.error('Could not download the account to this device:', cause);
        settle('failed', cause instanceof Error ? cause : new Error(String(cause)));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, userId, attempt]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  return { state, error, retry };
}

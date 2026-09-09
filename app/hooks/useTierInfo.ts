import { TIER_INFO_DISMISSED, readFlag, setFlag } from '../utils/prefs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/lib/auth/AuthProvider';

/**
 * Opens the 5-15-50 explainer the first time the user visits the board, and remembers a
 * "Don't show this again".
 *
 * The flag is per-device (see `app/utils/prefs.ts`) — re-showing it once on a second
 * device costs nothing, and it keeps a piece of UI trivia off the synced profile record.
 */
export function useTierInfo() {
  const { user } = useAuth();
  const userId = user?.id;
  const [visible, setVisible] = useState(false);
  // Auto-open is a once-per-mount event; without this the modal would reappear every time
  // the effect re-ran.
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (!userId || autoOpenedRef.current) return;

    let cancelled = false;
    void (async () => {
      const dismissed = await readFlag(TIER_INFO_DISMISSED, userId);
      if (cancelled || dismissed) return;
      autoOpenedRef.current = true;
      setVisible(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const open = useCallback(() => setVisible(true), []);

  const close = useCallback(
    (dontShowAgain: boolean) => {
      setVisible(false);
      // Only ever sets the flag: unticking the box in a later visit shouldn't resurrect
      // the auto-open for someone who already dismissed it.
      if (dontShowAgain && userId) void setFlag(TIER_INFO_DISMISSED, userId, true);
    },
    [userId]
  );

  return { visible, open, close };
}

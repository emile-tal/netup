import { useCallback, useEffect, useRef } from 'react';

import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Outbox from '@/db/models/Outbox';
import { runSync } from '@/db/sync/engine';
import useSyncStore from '../stores/syncStore';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useOptionalDB } from '@/db/dbProvider';
import { useDebouncedCallback } from './useDebouncedCallback';

/** Backstop cadence. Everything below is a faster path; this only catches what they miss. */
const INTERVAL_MS = 5 * 60 * 1000;

/**
 * Runs the sync loop for the signed-in user.
 *
 * Mounted in `app/_layout.tsx` rather than `app/(tabs)/_layout.tsx`, where
 * `useOutreachRepair` lives: `app/contacts/*` are Stack routes *outside* `(tabs)`
 * (CLAUDE.md §9), so a loop mounted there would stop running while the user is editing a
 * contact — exactly when writes happen.
 */
export function useSync() {
  // Optional, not `useDB`: this hook mounts above the auth guards, where there is no
  // database yet. Every effect below is a no-op until both a database and a user exist.
  const db = useOptionalDB();
  const { user } = useAuth();
  const userId = user?.id;

  const setStatus = useSyncStore(s => s.setStatus);
  const setPendingCount = useSyncStore(s => s.setPendingCount);
  const setError = useSyncStore(s => s.setError);
  const markSynced = useSyncStore(s => s.markSynced);

  // Guards against a sync firing after the user signs out mid-pass.
  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const sync = useCallback(async () => {
    if (!db || !userId) return;

    setStatus('syncing');
    try {
      await runSync(db, userId);
      if (activeRef.current) markSynced(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
      if (activeRef.current) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [db, userId, setStatus, setError, markSynced]);

  // Local writes land in bursts — saving a contact queues the root and every child edit —
  // so collapse them into one pass rather than syncing per row.
  const syncSoon = useDebouncedCallback(() => void sync(), 1500);

  // The outbox count is both the trigger for a push and the number the UI shows, so one
  // subscription serves both.
  useEffect(() => {
    if (!db || !userId) return;

    const subscription = db
      .get<Outbox>('outbox')
      .query()
      .observeCount()
      .subscribe({
        next: count => {
          setPendingCount(count);
          if (count > 0) syncSoon();
        },
        error: (error: unknown) => console.error('Outbox subscription failed:', error),
      });

    return () => subscription.unsubscribe();
  }, [db, userId, setPendingCount, syncSoon]);

  // Sign-in, and every remount for a new account.
  useEffect(() => {
    if (db && userId) void sync();
  }, [db, userId, sync]);

  // Coming back to the app is the moment another device's changes are most likely waiting.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void sync();
    });
    return () => subscription.remove();
  }, [sync]);

  // Regaining connectivity, which is when a backlog can finally drain.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) void sync();
    });
    return unsubscribe;
  }, [sync]);

  useEffect(() => {
    const id = setInterval(() => void sync(), INTERVAL_MS);
    return () => clearInterval(id);
  }, [sync]);
}

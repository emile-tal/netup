import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'error';

interface SyncState {
  status: SyncStatus;
  /** Local changes not yet accepted by the server — the live outbox row count. */
  pendingCount: number;
  lastSyncedAt: Date | null;
  error: Error | null;
  setStatus: (status: SyncStatus) => void;
  setPendingCount: (count: number) => void;
  setError: (error: Error | null) => void;
  markSynced: (at: Date) => void;
}

const useSyncStore = create<SyncState>(set => ({
  status: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  error: null,
  setStatus: status => set({ status }),
  setPendingCount: pendingCount => set({ pendingCount }),
  setError: error => set({ error, status: error ? 'error' : 'idle' }),
  markSynced: at => set({ lastSyncedAt: at, error: null, status: 'idle' }),
}));

export default useSyncStore;

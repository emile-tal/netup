import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Pull cursors: the newest server `updated_at` this device has already applied.
 *
 * There is **one cursor per table**, not one shared cursor. Contacts and reminders are
 * paginated independently, so a full page of contacts would otherwise advance a shared
 * cursor past reminders that had not been fetched yet — and those rows would never be
 * requested again.
 *
 * Kept in AsyncStorage rather than a local table on purpose. A new WatermelonDB table
 * means a schema bump plus a migration, and CLAUDE.md §7 documents that the migration
 * range is already awkward (`metadata` and `outbox` have no creating migration at all).
 * Not worth that risk for two timestamps.
 *
 * Keyed per user, matching the per-account database in `db/dbProvider.tsx`.
 */
export type CursorTable = 'contacts' | 'reminders';

export const EPOCH = new Date(0).toISOString();

const key = (userId: string, table: CursorTable) =>
  `netup.lastPulledAt.${table}.${userId}`;

export async function readCursor(userId: string, table: CursorTable): Promise<string> {
  try {
    return (await AsyncStorage.getItem(key(userId, table))) ?? EPOCH;
  } catch {
    // A read failure means a full re-pull: slow, but correct. Applying rows is
    // idempotent, so it costs bandwidth rather than data.
    return EPOCH;
  }
}

export async function writeCursor(
  userId: string,
  table: CursorTable,
  iso: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(key(userId, table), iso);
  } catch (error) {
    // Swallowed deliberately: losing a cursor re-pulls next time, which is recoverable.
    console.warn('Could not persist the sync cursor:', error);
  }
}

export async function clearCursors(userId: string): Promise<void> {
  try {
    await AsyncStorage.multiRemove([key(userId, 'contacts'), key(userId, 'reminders')]);
  } catch {
    // Nothing to do — see writeCursor.
  }
}

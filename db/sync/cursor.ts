import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Pull cursors: the newest server `updated_at` this device has already applied.
 *
 * There is **one cursor per table**, not one shared cursor. Each table is paginated
 * independently, so a full page of contacts would otherwise advance a shared cursor past
 * reminders that had not been fetched yet — and those rows would never be requested again.
 *
 * Kept in AsyncStorage rather than a local table on purpose. A new WatermelonDB table
 * means a schema bump plus a migration, and CLAUDE.md §7 documents that the migration
 * range is already awkward (`metadata` and `outbox` have no creating migration at all).
 * Not worth that risk for a handful of timestamps.
 *
 * Keyed per user, matching the per-account database in `db/dbProvider.tsx`.
 */
export const CURSOR_TABLES = ['profiles', 'contacts', 'reminders'] as const;

export type CursorTable = (typeof CURSOR_TABLES)[number];

export const EPOCH = new Date(0).toISOString();

const key = (userId: string, table: CursorTable) =>
  `netup.lastPulledAt.${table}.${userId}`;

/**
 * Whether this device has completed one full download for the account.
 *
 * This is what enforces the rule that an existing account cannot be *used* on a new device
 * until its data has arrived — see `app/providers/ProfileProvider.tsx`. Once set it is
 * never cleared except on sign-out, which is the point: after one successful pull the
 * device works offline indefinitely.
 *
 * It has to be its own flag rather than an inference from the cursors above, because
 * `writeCursor` only advances from rows that actually came back — an account with no
 * contacts and no reminders would leave every cursor sitting at `EPOCH` forever.
 */
const hydratedKey = (userId: string) => `netup.hydrated.${userId}`;

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

export async function readHydrated(userId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(hydratedKey(userId))) !== null;
  } catch {
    // Treat an unreadable flag as "not hydrated". The cost is one redundant sync pass
    // before the app opens; the alternative is opening an app with no data in it.
    return false;
  }
}

export async function markHydrated(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(hydratedKey(userId), new Date().toISOString());
  } catch (error) {
    // Not fatal: the next successful pull sets it again. Until then the user sees the
    // bootstrap spinner on launch rather than losing anything.
    console.warn('Could not persist the hydration flag:', error);
  }
}

export async function clearCursors(userId: string): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      ...CURSOR_TABLES.map(table => key(userId, table)),
      hydratedKey(userId),
    ]);
  } catch {
    // Nothing to do — see writeCursor.
  }
}

// The signed-in user themselves, as the UI sees them. One row per account: the local
// database file is already per-account (`app-${userId}.db`), so there is never a second.
export interface Profile {
  /** The Supabase auth user id. Deterministic, so pushing the row is an idempotent upsert. */
  id: string;
  displayName: string;
  /** Set when the first-run flow completes; its presence is not what gates the app. */
  onboardedAt?: Date;
}

import type { Database } from '@nozbe/watermelondb';
import { map } from 'rxjs';
import type { Profile as ProfileType } from '../../app/types/profile';
import Profile from '../models/Profile';
import { upsertMeta } from './metadata';
import { enqueueOutbox } from './outbox';

/**
 * The signed-in user's own record.
 *
 * There is exactly one row: the database file is already per-account
 * (`app-${userId}.db`), so nothing here filters by id. That matters for reads — a profile
 * that arrived by *sync* must resolve just as readily as one this device wrote, and on a
 * fresh device the pulled row is the only one there is.
 *
 * The row's id is always the Supabase auth user id. Keeping it deterministic is what makes
 * the push an idempotent upsert of one known row rather than a source of duplicates.
 */
function toDTO(row: Profile): ProfileType {
  return {
    id: row.id,
    displayName: row.displayName ?? '',
    onboardedAt: row.onboardedAt ? new Date(row.onboardedAt) : undefined,
  };
}

/** The profile, or null when this device has not got one yet. Reactive. */
export function observeProfile(db: Database) {
  return db
    .get<Profile>('profiles')
    .query()
    .observeWithColumns(['displayName', 'onboardedAt'])
    .pipe(map(rows => (rows[0] ? toDTO(rows[0]) : null)));
}

export async function readProfile(db: Database): Promise<ProfileType | null> {
  const rows = await db.get<Profile>('profiles').query().fetch();
  return rows[0] ? toDTO(rows[0]) : null;
}

/**
 * Finishes the first-run flow: stores the name and stamps `onboardedAt`.
 *
 * Writing the row locally is what flips the gate in `app/providers/ProfileProvider.tsx`
 * to `ready`, so the user enters the app immediately and the push happens behind them.
 */
export async function completeOnboarding(
  db: Database,
  userId: string,
  displayName: string
): Promise<ProfileType> {
  let row!: Profile;

  await db.write(async () => {
    const existing = await db.get<Profile>('profiles').query().fetch();

    if (existing.length) {
      row = existing[0];
      await row.update((p: Profile) => {
        p.displayName = displayName;
        // Keep the original date if this account has onboarded before (a second device,
        // or a re-run after an interrupted first attempt).
        p.onboardedAt = p.onboardedAt ?? Date.now();
      });
    } else {
      row = await db.get<Profile>('profiles').create((p: Profile) => {
        // The auth user id, not a generated one — see the note at the top of this file.
        p._raw.id = userId;
        p.displayName = displayName;
        p.onboardedAt = Date.now();
      });
    }

    await upsertMeta(db, 'profile', row.id);
    await enqueueOutbox(db, 'profile', existing.length ? 'update' : 'create', toDTO(row));
  });

  return toDTO(row);
}

export async function updateProfile(
  db: Database,
  changes: Partial<Omit<ProfileType, 'id'>>
) {
  await db.write(async () => {
    const rows = await db.get<Profile>('profiles').query().fetch();
    const row = rows[0];
    if (!row) return;

    await row.update((p: Profile) => {
      if (changes.displayName !== undefined) p.displayName = changes.displayName;
      if (changes.onboardedAt !== undefined) {
        p.onboardedAt = changes.onboardedAt?.getTime();
      }
    });

    await upsertMeta(db, 'profile', row.id);
    await enqueueOutbox(db, 'profile', 'update', { id: row.id, ...changes });
  });
}

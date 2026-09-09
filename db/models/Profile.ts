import { field, text } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';

/**
 * The signed-in user. Exactly one row per database file, and its `id` is always the
 * Supabase auth user id — see `db/repo/profile.ts`.
 */
export default class Profile extends Model {
  static table = 'profiles' as const;

  @text('displayName') displayName!: string;
  /** Epoch-ms, like every other date in the schema. */
  @field('onboardedAt') onboardedAt?: number;
}

import {
  addColumns,
  createTable,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

/**
 * WatermelonDB requires the highest `toVersion` here to match `schema.version`, and it is
 * strict about it: the LokiJS (web) adapter *throws* "Missing migration" at startup when
 * the range falls short, where the SQLite adapter would quietly reset. So every schema
 * bump needs an entry, even one that cannot fully express itself.
 *
 * v3 → v4 and v4 → v5 are covered. Older ranges are left out deliberately: v2 folded the
 * `firstMeetings` table into `contacts` and changed column types, which migrations cannot
 * express at all. A v1 or v2 dev database therefore falls outside the range, and the
 * adapter rebuilds it from the schema — the right outcome for a pre-production app with no
 * data to preserve.
 */
export const migrations = schemaMigrations({
  migrations: [
    {
      // v5 adds the `profiles` table: the signed-in user's own record. A new table needs
      // `createTable` — `addColumns` cannot conjure one, and a v5 entry that only added
      // columns would report success while leaving the table missing, which is worse than
      // no entry at all.
      toVersion: 5,
      steps: [
        createTable({
          name: 'profiles',
          columns: [
            { name: 'displayName', type: 'string' },
            { name: 'onboardedAt', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      // v4 replaces relationshipStrength/outreachGoal with the 5-15-50 tier, and tags
      // reminders with their origin. Only the additions are expressible; the two dropped
      // columns linger unread in a migrated v3 database, which is harmless because the
      // schema is what the repo layer reads.
      toVersion: 4,
      steps: [
        addColumns({
          table: 'contacts',
          columns: [
            { name: 'tier', type: 'number', isOptional: true, isIndexed: true },
            { name: 'lastOutreachAt', type: 'number', isOptional: true },
          ],
        }),
        addColumns({
          table: 'reminders',
          columns: [
            { name: 'origin', type: 'string', isOptional: true, isIndexed: true },
          ],
        }),
      ],
    },
  ],
});

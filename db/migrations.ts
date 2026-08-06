import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      // v3 adds the agenda check-off flag. Additive, so it migrates in place.
      toVersion: 3,
      steps: [
        addColumns({
          table: 'reminders',
          columns: [{ name: 'completed', type: 'boolean', isOptional: true }],
        }),
      ],
    },
    // NOTE: there is deliberately no `toVersion: 2` entry. v2 folded the firstMeetings
    // table into contacts and changed column types; WatermelonDB migrations can only add
    // tables/columns, so v2 is not migratable in place. Leaving the range uncovered makes
    // the SQLite adapter fall back to "Migrations not available for this version range,
    // resetting database instead" — which is what a v1 dev DB needs. An empty
    // `steps: []` entry would be worse than nothing: it would report a successful
    // migration while leaving contacts without firstMetDate/firstMetLocation.
  ],
});

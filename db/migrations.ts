import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    // schema v2 folds firstMeetings into contacts and standardizes dates to epoch-ms.
    // WatermelonDB migrations can only add tables/columns — they cannot drop tables or
    // change a column's type — so v2 cannot be migrated in place. Pre-release with only
    // dev-seed data, so reset the dev DB (resetAndSeed / unsafeResetDatabase) instead.
  ],
});

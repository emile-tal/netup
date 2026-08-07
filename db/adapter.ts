import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import type { DatabaseAdapter } from '@nozbe/watermelondb/adapters/type';
import { migrations } from './migrations';
import { schema } from './schema';

/**
 * Native (iOS / Android) adapter. The web build resolves `adapter.web.ts` instead —
 * keep both signatures identical, TypeScript only ever typechecks this one.
 */
export function makeAdapter(dbName: string): DatabaseAdapter {
  return new SQLiteAdapter({
    schema,
    migrations,
    dbName,
  });
}

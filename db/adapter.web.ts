import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import type { DatabaseAdapter } from '@nozbe/watermelondb/adapters/type';
import { migrations } from './migrations';
import { schema } from './schema';

/**
 * Web adapter. SQLite is native-only, so the browser build persists to IndexedDB via
 * LokiJS. This is a per-origin database, entirely separate from the device database —
 * they only converge once the sync push loop + backend exist.
 */
export function makeAdapter(dbName: string): DatabaseAdapter {
  return new LokiJSAdapter({
    schema,
    migrations,
    // IndexedDB store name — drop the native `.db` file suffix.
    dbName: dbName.replace(/\.db$/, ''),
    // Workers add throughput but Metro can't bundle loki.worker.js cleanly, and the
    // quota/version callbacks below only fire when workers are off.
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onQuotaExceededError: error =>
      console.error('IndexedDB quota exceeded — falling back to in-memory', error),
    onSetUpError: error => console.error('WatermelonDB (LokiJS) setup failed', error),
  });
}

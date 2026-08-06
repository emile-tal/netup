import type { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';
import type { OutboxEntity, OutboxOp } from '../../app/types/sync';
import Outbox from '../models/Outbox';

/**
 * Queues a change for a future backend to push. Must be called from inside a
 * `db.write(...)` block so the row lands in the same transaction as the change it
 * describes — otherwise a crash between the two leaves the log inconsistent.
 *
 * `payload` is the DTO-shaped change (or `{ id }` for deletes); it is JSON-stringified,
 * so `Date`s become ISO strings on the way out.
 */
export async function enqueueOutbox(
  db: Database,
  entity: OutboxEntity,
  op: OutboxOp,
  payload: unknown,
  now = Date.now()
) {
  await db.get<Outbox>('outbox').create((o: Outbox) => {
    o.entity = entity;
    o.op = op;
    o.payloadJson = JSON.stringify(payload);
    o.queuedAt = now;
    o.attempts = 0;
  });
}

/** Oldest-first queue contents — the order a future sync loop should push them in. */
export async function readOutboxQueue(db: Database, limit = 100) {
  return db
    .get<Outbox>('outbox')
    .query(Q.sortBy('queued_at', Q.asc), Q.take(limit))
    .fetch();
}

/** Called once a queued op has been accepted by the backend. */
export async function clearOutboxEntries(db: Database, ids: string[]) {
  if (!ids.length) return;

  await db.write(async () => {
    const rows = await db
      .get<Outbox>('outbox')
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    await Promise.all(rows.map(row => row.destroyPermanently()));
  });
}

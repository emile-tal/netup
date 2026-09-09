import { readContact } from '../repo/contacts';
import { readProfile } from '../repo/profile';
import { readReminder } from '../repo/reminders';
import { clearOutboxEntries, readOutboxQueue } from '../repo/outbox';
import { toRemoteContactPayload, toRemoteProfile, toRemoteReminder } from './mapping';

import type { Database } from '@nozbe/watermelondb';
import type { OutboxEntity } from '../../app/types/sync';
import { supabase } from '../../lib/supabase';

/** One pass moves at most this many queued ops, so a long backlog drains in chunks. */
const BATCH = 200;

const PUSH_ORDER: Record<OutboxEntity, number> = {
  profile: 0,
  contact: 1,
  reminder: 2,
};

/** Sorts an entity this build does not know about last, rather than first. */
const UNKNOWN_ORDER = 99;

interface DirtyEntity {
  entity: OutboxEntity;
  id: string;
  /** The outbox rows this collapsed from — cleared together once the push succeeds. */
  outboxIds: string[];
}

/**
 * Collapses the queue to a distinct set of `(entity, id)` pairs.
 *
 * The outbox is treated as a **dirty-id log, not a replay log**. `enqueueOutbox` stores a
 * partial `changes` object for updates, so replaying operation-by-operation would be
 * order-sensitive, non-idempotent, and wrong the moment a retry duplicated a batch.
 * Pushing the *current* state of each touched record instead is idempotent and
 * self-healing: a failed pass simply runs again.
 */
function collapse(rows: { id: string; entity: string; payloadJson: string }[]): {
  dirty: DirtyEntity[];
  /** Outbox rows carrying no usable id — unpushable, so drop them instead of retrying. */
  unusableIds: string[];
} {
  const byKey = new Map<string, DirtyEntity>();
  const unusableIds: string[] = [];

  for (const row of rows) {
    let entityId: string | undefined;
    try {
      entityId = (JSON.parse(row.payloadJson) as { id?: string }).id;
    } catch {
      entityId = undefined;
    }

    // Nothing to push and nothing to retry: without an id the entry can never resolve to
    // a record, so leaving it queued would occupy a batch slot forever.
    if (!entityId) {
      unusableIds.push(row.id);
      continue;
    }

    const entity = row.entity as OutboxEntity;
    const key = `${entity}:${entityId}`;
    const existing = byKey.get(key);
    if (existing) existing.outboxIds.push(row.id);
    else byKey.set(key, { entity, id: entityId, outboxIds: [row.id] });
  }

  // Contacts before reminders, always. `reminders.contact_id` is a foreign key, and
  // `createContact` queues the generated outreach reminder *before* the contact row it
  // belongs to — so pushing in queue order would reject the reminder with a 23503 until
  // the contact happened to go up in some later pass. The profile depends on nothing, so
  // its position is fixed only to keep the order deterministic.
  //
  // `Array.prototype.sort` is stable, so rows of the same entity keep their queue order.
  const dirty = [...byKey.values()].sort(
    (a, b) => (PUSH_ORDER[a.entity] ?? UNKNOWN_ORDER) - (PUSH_ORDER[b.entity] ?? UNKNOWN_ORDER)
  );

  return { dirty, unusableIds };
}

async function pushProfile(db: Database, _id: string, userId: string) {
  const profile = await readProfile(db);

  // No tombstone branch: a profile is never deleted. Gone locally means there is nothing
  // to say about it, so clear the queue entry and move on.
  if (!profile) return;

  const { error } = await supabase
    .from('profiles')
    .upsert(toRemoteProfile(profile, userId), { onConflict: 'id' });
  if (error) throw error;
}

async function pushContact(db: Database, id: string, _userId: string) {
  const contact = await readContact(db, id);

  if (!contact) {
    // Gone locally means deleted. Tombstone rather than delete: a hard delete is
    // invisible to another device that is still pulling. If the row was created and
    // deleted before it ever reached the server this updates nothing, which is correct.
    const { error } = await supabase
      .from('contacts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return;
  }

  // One RPC, one transaction: parent upsert, child upserts, and the delete of children
  // that are no longer in the set.
  const { error } = await supabase.rpc('push_contact', {
    p: toRemoteContactPayload(contact),
  });
  if (error) throw error;
}

async function pushReminder(db: Database, id: string, userId: string) {
  const reminder = await readReminder(db, id);

  if (!reminder) {
    const { error } = await supabase
      .from('reminders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('reminders')
    .upsert(toRemoteReminder(reminder, userId), { onConflict: 'id' });
  if (error) throw error;
}

type Pusher = (db: Database, id: string, userId: string) => Promise<void>;

/**
 * One entry per entity. This replaced an `if contact … else reminder` branch, which
 * silently pushed anything it did not recognise into the reminders table.
 */
const PUSHERS: Record<OutboxEntity, Pusher> = {
  profile: pushProfile,
  contact: pushContact,
  reminder: pushReminder,
};

/**
 * Drains the outbox. Returns how many distinct records were pushed.
 *
 * Stops at the first failure and leaves the rest queued: the queue is the durable record
 * of what still needs to go up, so giving up early is safe and retrying is free.
 */
export async function pushOutbox(db: Database, userId: string): Promise<number> {
  const queued = await readOutboxQueue(db, BATCH);
  if (!queued.length) return 0;

  const { dirty, unusableIds } = collapse(
    queued.map(row => ({
      id: row.id,
      entity: row.entity,
      payloadJson: row.payloadJson,
    }))
  );

  if (unusableIds.length) {
    console.warn(`Dropping ${unusableIds.length} outbox entries with no id.`);
    await clearOutboxEntries(db, unusableIds);
  }

  let pushed = 0;

  for (const item of dirty) {
    const push = PUSHERS[item.entity];

    // An entity this build has no pusher for can never resolve, so drop the entry rather
    // than letting it occupy a batch slot on every future pass.
    if (!push) {
      console.warn(`Dropping outbox entry for unknown entity "${item.entity}".`);
      await clearOutboxEntries(db, item.outboxIds);
      continue;
    }

    try {
      await push(db, item.id, userId);
    } catch (error) {
      // Record the attempt so a poison entry is visible rather than silently retried
      // forever, then stop the pass — the remaining items stay queued.
      await Promise.all(
        queued
          .filter(row => item.outboxIds.includes(row.id))
          .map(row => row.bumpAttempts())
      ).catch(() => undefined);
      throw error;
    }

    await clearOutboxEntries(db, item.outboxIds);
    pushed += 1;
  }

  return pushed;
}

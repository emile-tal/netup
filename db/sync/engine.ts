import type { Database } from '@nozbe/watermelondb';
import { pullChanges } from './pull';
import { pushOutbox } from './push';

export interface SyncResult {
  pushed: number;
  applied: number;
}

/**
 * One sync pass: push first, then pull.
 *
 * The order matters. Pushing first means the server already has our local edits by the
 * time we ask what changed, which shrinks the window in which a pulled row could be older
 * than something we have not sent yet (`pull.ts` guards the remainder by skipping ids
 * with queued changes).
 */
async function runOnce(db: Database, userId: string): Promise<SyncResult> {
  const pushed = await pushOutbox(db, userId);
  const applied = await pullChanges(db, userId);
  return { pushed, applied };
}

/**
 * Passes must not overlap — two concurrent runs would race on the cursor and could apply
 * the same page twice. Callers that arrive mid-flight join the run already going rather
 * than starting a second one.
 */
let inFlight: Promise<SyncResult> | null = null;

export function runSync(db: Database, userId: string): Promise<SyncResult> {
  if (inFlight) return inFlight;

  inFlight = runOnce(db, userId).finally(() => {
    inFlight = null;
  });

  return inFlight;
}

export const isSyncing = () => inFlight !== null;

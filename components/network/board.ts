// Plumbing shared by both 5-15-50 boards. `TierBoard.tsx` (native, gesture-handler) and
// `TierBoard.web.tsx` (dnd-kit) diverge only in how a drag is captured — the buckets, the
// drop-target vocabulary and the hit-testing live here so they can't drift.

import type { ContactSummary } from '@/db/repo/contacts';
import type { Tier } from '@/app/types/contacts';
import { TIERS, isTier } from '@/app/utils/outreach';

/** Where a contact can be dropped: into one of the three circles, or out of them. */
export type DropTarget = Tier | null;

export interface TierBuckets {
  unassigned: ContactSummary[];
  byTier: Record<Tier, ContactSummary[]>;
}

export interface TierBoardProps {
  buckets: TierBuckets;
  /** Called once per completed drag. `null` drops the contact out of the 5-15-50. */
  onMove: (contactId: string, target: DropTarget) => void;
}

/** Splits the contact list into the four board regions, preserving the repo's ordering. */
export function bucketByTier(contacts: ContactSummary[]): TierBuckets {
  const byTier = { 5: [], 15: [], 50: [] } as Record<Tier, ContactSummary[]>;
  const unassigned: ContactSummary[] = [];

  for (const contact of contacts) {
    if (contact.tier) byTier[contact.tier].push(contact);
    else unassigned.push(contact);
  }

  return { unassigned, byTier };
}

export const UNASSIGNED_KEY = 'unassigned';

/** Stable id for a drop zone — dnd-kit needs a string, the native board keys a Map by it. */
export function dropZoneKey(target: DropTarget): string {
  return target === null ? UNASSIGNED_KEY : `tier-${target}`;
}

/** Inverse of `dropZoneKey`. `undefined` for a key that isn't a drop zone. */
export function dropZoneTarget(key: string): DropTarget | undefined {
  if (key === UNASSIGNED_KEY) return null;
  const tier = Number(key.slice('tier-'.length));
  return isTier(tier) ? tier : undefined;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Which drop zone sits under a point in window coordinates, or `undefined` if none does.
 * `null` is a real answer here (the unassigned strip), so callers must check for
 * `undefined` rather than falsiness.
 */
export function hitTest(
  zones: Map<string, Rect>,
  x: number,
  y: number
): DropTarget | undefined {
  for (const [key, rect] of zones) {
    const inside =
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height;
    if (inside) return dropZoneTarget(key);
  }
  return undefined;
}

/** Board regions in render order: the three circles, then the unassigned pool. */
export const BOARD_TARGETS: readonly DropTarget[] = [...TIERS, null];

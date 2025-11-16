import type { Database } from '@nozbe/watermelondb';
import Metadata from '../models/Metadata';
import { Q } from '@nozbe/watermelondb';

export async function readMeta(db: Database, entity: string, entityId: string) {
  const rows = await db
    .get<Metadata>('metadata')
    .query(Q.where('entity', entity), Q.where('entity_id', entityId))
    .fetch();

  const m = rows[0];
  return {
    createdAt: m?.createdAt ?? null,
    updatedAt: m?.updatedAt ?? null,
    deletedAt: m?.deletedAt ?? null,
  };
}

export async function upsertMeta(
  db: Database,
  entity: string,
  entityId: string,
  now = Date.now()
) {
  const existing = await db
    .get<Metadata>('metadata')
    .query(Q.where('entity', entity), Q.where('entity_id', entityId))
    .fetch();

  if (existing.length) {
    await existing[0].update((m: Metadata) => {
      m.updatedAt = now;
    });
  } else {
    await db.get<Metadata>('metadata').create((m: Metadata) => {
      m.entity = entity;
      m.entityId = entityId;
      m.createdAt = now;
      m.updatedAt = now;
    });
  }
}

export async function markDeletedMeta(
  db: Database,
  entity: string,
  entityId: string,
  now = Date.now()
) {
  const existing = await db
    .get<Metadata>('metadata')
    .query(Q.where('entity', entity), Q.where('entity_id', entityId))
    .fetch();

  if (existing.length) {
    await existing[0].update((m: Metadata) => {
      m.deletedAt = now;
      m.updatedAt = now;
    });
  } else {
    await db.get<Metadata>('metadata').create((m: Metadata) => {
      m.entity = entity;
      m.entityId = entityId;
      m.createdAt = now;
      m.updatedAt = now;
      m.deletedAt = now;
    });
  }
}

import { field, text, writer } from '@nozbe/watermelondb/decorators';

// src/db/models/Metadata.ts
import { Model } from '@nozbe/watermelondb';

export default class Metadata extends Model {
  static table = 'metadata' as const;

  @text('entity') entity!: string;
  @text('entity_id') entityId!: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  @field('deleted_at') deletedAt?: number;

  @writer async touch(now = Date.now()) {
    await this.update(m => {
      m.updatedAt = now;
    });
  }

  @writer async markDeleted(now = Date.now()) {
    await this.update(m => {
      m.deletedAt = now;
      m.updatedAt = now;
    });
  }
}

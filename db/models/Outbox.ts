import { field, text, writer } from '@nozbe/watermelondb/decorators';

import { Model } from '@nozbe/watermelondb';

export default class Outbox extends Model {
  static table = 'outbox' as const;

  @text('entity') entity!: string; // 'contact' | 'reminder'
  @text('op') op!: string; // 'create' | 'update' | 'delete'
  @text('payload_json') payloadJson!: string;
  @field('queued_at') queuedAt!: number;
  @field('attempts') attempts!: number;

  @writer async bumpAttempts() {
    await this.update(o => {
      o.attempts += 1;
    });
  }
}

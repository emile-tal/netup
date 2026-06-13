// Sync queue (outbox) value constraints. Shared by the Outbox model and future
// enqueue logic so a backend can later push/pull a well-typed change log.
export type OutboxEntity = 'contact' | 'reminder';
export type OutboxOp = 'create' | 'update' | 'delete';

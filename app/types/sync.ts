// Sync queue (outbox) value constraints. Shared by the Outbox model and the metadata
// side-table so the change log a backend pushes/pulls stays well-typed.
export type OutboxEntity = 'profile' | 'contact' | 'reminder';
export type OutboxOp = 'create' | 'update' | 'delete';

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'contacts',
      columns: [
        { name: 'firstName', type: 'string', isIndexed: true },
        { name: 'lastName', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'phone', type: 'string', isIndexed: true },
        { name: 'street', type: 'string', isIndexed: true },
        { name: 'city', type: 'string', isIndexed: true },
        { name: 'state', type: 'string', isIndexed: true },
        { name: 'zip', type: 'string', isIndexed: true },
        { name: 'country', type: 'string', isIndexed: true },
        { name: 'company', type: 'string', isIndexed: true },
        { name: 'jobTitle', type: 'string', isIndexed: true },
        { name: 'createdAt', type: 'number', isIndexed: true },
        { name: 'updatedAt', type: 'number', isIndexed: true },
        { name: 'deletedAt', type: 'number', isOptional: true },
        { name: 'alumni', type: 'string', isIndexed: true },
        { name: 'relationshipStrength', type: 'number', isIndexed: true },
        { name: 'outreachGoal', type: 'number', isIndexed: true },
        { name: 'source', type: 'string', isIndexed: true },
        { name: 'firstMeeting_date', type: 'string', isIndexed: true },
        { name: 'firstMeeting_location', type: 'string', isIndexed: true },
        { name: 'notes', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'reminders',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'date_ts', type: 'number', isIndexed: true },
        { name: 'contact_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'outbox',
      columns: [
        { name: 'entity', type: 'string' }, // 'contact' | 'reminder'
        { name: 'op', type: 'string' }, // 'create' | 'update' | 'delete'
        { name: 'payload_json', type: 'string' },
        { name: 'queued_at', type: 'number' },
        { name: 'attempts', type: 'number' },
      ],
    }),
  ],
});

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'contacts',
      columns: [
        { name: 'firstName', type: 'string', isOptional: true, isIndexed: true },
        { name: 'lastName', type: 'string', isOptional: true, isIndexed: true },
        { name: 'company', type: 'string', isOptional: true, isIndexed: true },
        { name: 'jobTitle', type: 'string', isOptional: true, isIndexed: true },
        { name: 'alumni', type: 'string', isOptional: true, isIndexed: true },
        { name: 'relationshipStrength', type: 'number', isOptional: true },
        { name: 'outreachGoal', type: 'number', isOptional: true },
        { name: 'source', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'emails',
      columns: [
        { name: 'label', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'contact_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'phoneNumbers',
      columns: [
        { name: 'label', type: 'string' },
        { name: 'areaCode', type: 'string', isOptional: true },
        { name: 'phoneNumber', type: 'string' },
        { name: 'contact_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'addresses',
      columns: [
        { name: 'label', type: 'string' },
        { name: 'street', type: 'string', isOptional: true },
        { name: 'city', type: 'string', isOptional: true },
        { name: 'state', type: 'string', isOptional: true },
        { name: 'zip', type: 'string', isOptional: true },
        { name: 'country', type: 'string', isOptional: true },
        { name: 'contact_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'firstMeetings',
      columns: [
        { name: 'date', type: 'string', isOptional: true },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'contact_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'reminders',
      columns: [
        { name: 'title', type: 'string', isIndexed: true },
        { name: 'date_ts', type: 'number', isIndexed: true, isOptional: true },
        { name: 'contact_id', type: 'string', isIndexed: true, isOptional: true },
      ],
    }),
    tableSchema({
      name: 'metadata',
      columns: [
        { name: 'entity', type: 'string', isIndexed: true },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
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

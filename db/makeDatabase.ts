import * as Crypto from 'expo-crypto';

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { migrations } from './migrations';
import Address from './models/Address';
import Contact from './models/Contact';
import Email from './models/Email';
import FirstMeeting from './models/FirstMeeting';
import Metadata from './models/Metadata';
import Outbox from './models/Outbox';
import PhoneNumber from './models/PhoneNumber';
import Reminder from './models/Reminder';
import { schema } from './schema';

setGenerator(() => Crypto.randomUUID());

export function makeDatabase(dbName = 'app-anon.db') {
  const adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName,
  });

  return new Database({
    adapter,
    modelClasses: [
      Contact,
      Email,
      PhoneNumber,
      Address,
      FirstMeeting,
      Reminder,
      Metadata,
      Outbox,
    ],
  });
}

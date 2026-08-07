import * as Crypto from 'expo-crypto';

import { Database } from '@nozbe/watermelondb';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import { makeAdapter } from './adapter';
import Address from './models/Address';
import Contact from './models/Contact';
import Email from './models/Email';
import Metadata from './models/Metadata';
import Outbox from './models/Outbox';
import PhoneNumber from './models/PhoneNumber';
import Reminder from './models/Reminder';

setGenerator(() => Crypto.randomUUID());

export function makeDatabase(dbName = 'app-anon.db') {
  return new Database({
    adapter: makeAdapter(dbName),
    modelClasses: [
      Contact,
      Email,
      PhoneNumber,
      Address,
      Reminder,
      Metadata,
      Outbox,
    ],
  });
}

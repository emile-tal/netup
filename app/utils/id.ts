import * as Crypto from 'expo-crypto';

/**
 * Client-side id for rows that only exist in the edit store so far (a new email/phone/
 * address the user just added). The repo treats ids it does not find in the DB as
 * inserts, so these never need to match a persisted id.
 */
export function newLocalId(): string {
  return Crypto.randomUUID();
}

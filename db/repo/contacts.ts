import type { Database } from '@nozbe/watermelondb';
import Contact from '../models/Contact';
// src/db/repo/contactsList.ts
import { Q } from '@nozbe/watermelondb';
import { map } from 'rxjs/operators';

export type ContactSummary = { id: string; firstName: string; lastName: string };

export function observeContactSummaries(db: Database, search?: string) {
  const q = (search ?? '').trim().toLowerCase();

  const query = q
    ? db
        .get<Contact>('contacts')
        .query(
          Q.or(
            Q.where('firstName', Q.like(`%${q}%`)),
            Q.where('lastName', Q.like(`%${q}%`))
          ),
          Q.sortBy('lastName', Q.asc),
          Q.sortBy('firstName', Q.asc)
        )
    : db
        .get<Contact>('contacts')
        .query(Q.sortBy('lastName', Q.asc), Q.sortBy('firstName', Q.asc));

  return query
    .observe()
    .pipe(
      map(rows =>
        rows.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))
      )
    );
}

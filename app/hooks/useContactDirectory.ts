import { useEffect, useState } from 'react';

import type { ContactSummary } from '../types/contacts';
import { observeContactSummaries } from '@/db/repo/contacts';
import { useDB } from '@/db/dbProvider';

/**
 * Every contact, unfiltered — what `@` tagging needs to match a name against
 * (`app/utils/mentions.ts`).
 *
 * Its own subscription and its own state, like `useTierBoard`: the contacts screen owns
 * `contactStore` and keeps it filtered by the search query, so sharing that slice would
 * mean a tag popup that can only find the contacts the user last searched for
 * (CLAUDE.md §6).
 *
 * **Call it once per screen and pass the list down.** It is cheap but not free — one
 * subscription per editable row would mean one per outreach in the day.
 */
export function useContactDirectory(): ContactSummary[] {
  const db = useDB();
  const [contacts, setContacts] = useState<ContactSummary[]>([]);

  useEffect(() => {
    const subscription = observeContactSummaries(db).subscribe({
      next: setContacts,
      error: (cause: unknown) => console.error('Error loading contacts to tag:', cause),
    });

    return () => subscription.unsubscribe();
  }, [db]);

  return contacts;
}

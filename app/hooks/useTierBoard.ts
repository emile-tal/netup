import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ContactSummary } from '@/db/repo/contacts';
import type { DropTarget } from '@/components/network/board';
import { bucketByTier } from '@/components/network/board';
import { notify } from '../utils/alert';
import { observeContactSummaries } from '@/db/repo/contacts';
import { setContactTier } from '@/db/repo/outreach';
import { useDB } from '@/db/dbProvider';

/**
 * Backs the 5-15-50 board: the whole contact list, bucketed by circle, plus the one write
 * the board performs.
 *
 * Deliberately holds its own state rather than `contactStore`. The contacts screen owns
 * that slice and keeps it filtered by the search query; the board always needs every
 * contact, so sharing the slice would make the two screens fight (CLAUDE.md §6).
 */
export function useTierBoard() {
  const db = useDB();
  const [contacts, setContacts] = useState<ContactSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const subscription = observeContactSummaries(db).subscribe({
      next: rows => {
        setContacts(rows);
        setError(null);
        setLoading(false);
      },
      error: (cause: unknown) => {
        console.error('Error loading the 5-15-50 board:', cause);
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db]);

  const buckets = useMemo(() => bucketByTier(contacts), [contacts]);

  // No optimistic state: `setContactTier` also rewrites the contact's outreach reminder,
  // and the observable pushes the moved contact back within a frame.
  const move = useCallback(
    (contactId: string, target: DropTarget) => {
      setContactTier(db, contactId, target).catch(cause => {
        console.error('Error moving contact between circles:', cause);
        notify('Could not move', 'The contact stayed where it was.');
      });
    },
    [db]
  );

  return { buckets, loading, error, move, total: contacts.length };
}

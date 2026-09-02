import { useCallback, useEffect, useState } from 'react';

import { Contact } from '../types/contacts';
import { observeContact } from '@/db/repo/contacts';
import { useDB } from '@/db/dbProvider';

interface UseContactResult {
  contact: Contact | null;
  loading: boolean;
  /** Set when the read failed; a missing contact is `contact: null` with no error. */
  error: Error | null;
  reload: () => void;
}

/**
 * Loads one contact through the repo layer. Shared by the view and edit screens so the
 * subscription (and its loading/error handling) lives in exactly one place.
 *
 * Reactive, not a one-shot read: a change arriving from anywhere — another screen, or a
 * sync pull writing a remote edit — reaches these screens without a manual reload.
 */
export function useContact(id: string | undefined): UseContactResult {
  const db = useDB();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Resubscribes — the observable is the source of truth, so "retry" means start it over.
  const reload = useCallback(() => setReloadToken(token => token + 1), []);

  useEffect(() => {
    if (!id) {
      setContact(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const subscription = observeContact(db, id).subscribe({
      next: result => {
        setContact(result);
        setLoading(false);
      },
      error: (err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db, id, reloadToken]);

  return { contact, loading, error, reload };
}

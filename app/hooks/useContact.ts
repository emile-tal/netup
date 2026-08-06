import { useCallback, useEffect, useState } from 'react';

import { Contact } from '../types/contacts';
import { readContact } from '@/db/repo/contacts';
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
 * fetch effect (and its loading/error handling) lives in exactly one place.
 */
export function useContact(id: string | undefined): UseContactResult {
  const db = useDB();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken(token => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setContact(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    readContact(db, id)
      .then(result => {
        if (cancelled) return;
        setContact(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [db, id, reloadToken]);

  return { contact, loading, error, reload };
}

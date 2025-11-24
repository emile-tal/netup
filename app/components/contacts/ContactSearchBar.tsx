import { useCallback, useEffect, useRef, useState } from 'react';

import useContactStore from '@/app/stores/contactStore';
import { useDB } from '@/db/dbProvider';
import { observeContactSummaries } from '@/db/repo/contacts';
import SearchBar from '../SearchBar';

const ContactSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const setContactSummaries = useContactStore(state => state.setContactSummaries);
  const setSearchLoading = useContactStore(state => state.setSearchLoading);
  const setNoResults = useContactStore(state => state.setNoResults);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const db = useDB();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const handleDebouncedSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setSearchLoading(true);
      setNoResults(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      timeoutRef.current = setTimeout(() => {
        const subscription = observeContactSummaries(db, text).subscribe({
          next: data => {
            if (data.length === 0) {
              setNoResults(true);
            } else {
              setNoResults(false);
              setContactSummaries(data);
            }
            setSearchLoading(false);
          },
          error: error => {
            setSearchLoading(false);
            console.error('Error loading contacts:', error);
          },
        });
        timeoutRef.current = null;
        subscriptionRef.current = subscription;
      }, 500);
    },
    [db, searchQuery]
  );

  return <SearchBar onChangeText={handleDebouncedSearch} value={searchQuery} />;
};

export default ContactSearchBar;

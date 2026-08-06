import { useCallback, useState } from 'react';

import SearchBar from '../SearchBar';
import useContactStore from '@/app/stores/contactStore';
import { useDebouncedCallback } from '@/app/hooks/useDebouncedCallback';

/**
 * Owns the text field only. The debounced value is pushed into the contact store; the
 * list screen holds the single DB subscription that reacts to it.
 */
const ContactSearchBar = () => {
  const [text, setText] = useState('');
  const setSearchQuery = useContactStore(state => state.setSearchQuery);
  const setSearchLoading = useContactStore(state => state.setSearchLoading);

  const commitQuery = useDebouncedCallback((value: string) => setSearchQuery(value));

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);
      setSearchLoading(true);
      commitQuery(value);
    },
    [commitQuery, setSearchLoading]
  );

  return <SearchBar onChangeText={handleChangeText} value={text} />;
};

export default ContactSearchBar;

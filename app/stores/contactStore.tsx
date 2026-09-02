import { ContactSummary } from '@/app/types/contacts';
import { create } from 'zustand';

interface ContactStore {
  contactSummaries: ContactSummary[];
  setContactSummaries: (summaries: ContactSummary[]) => void;
  /**
   * The debounced search text. The list screen owns the single subscription and re-runs
   * it whenever this changes, so search results and the full list can't fight over
   * `contactSummaries`.
   */
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchLoading: boolean;
  setSearchLoading: (loading: boolean) => void;
  searchError: Error | null;
  setSearchError: (error: Error | null) => void;
  noResults: boolean;
  setNoResults: (noResults: boolean) => void;
}

const useContactStore = create<ContactStore>(set => ({
  contactSummaries: [],
  setContactSummaries: (summaries: ContactSummary[]) =>
    set({ contactSummaries: summaries }),
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  searchLoading: false,
  setSearchLoading: (loading: boolean) => set({ searchLoading: loading }),
  searchError: null,
  setSearchError: (error: Error | null) => set({ searchError: error }),
  noResults: false,
  setNoResults: (noResults: boolean) => set({ noResults: noResults }),
}));

export default useContactStore;

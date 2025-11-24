import { ContactSummary } from '@/db/repo/contacts';
import { create } from 'zustand';

interface ContactStore {
  contactSummaries: ContactSummary[];
  setContactSummaries: (summaries: ContactSummary[]) => void;
  searchLoading: boolean;
  setSearchLoading: (loading: boolean) => void;
  noResults: boolean;
  setNoResults: (noResults: boolean) => void;
}

const useContactStore = create<ContactStore>((set, get) => ({
  contactSummaries: [],
  setContactSummaries: (summaries: ContactSummary[]) =>
    set({ contactSummaries: summaries }),
  searchLoading: false,
  setSearchLoading: (loading: boolean) => set({ searchLoading: loading }),
  noResults: false,
  setNoResults: (noResults: boolean) => set({ noResults: noResults }),
}));

export default useContactStore;

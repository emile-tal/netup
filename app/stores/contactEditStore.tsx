import { Contact } from '../types/contacts';
import { create } from 'zustand';

interface ContactEditStore {
  // The contact being edited, with in-progress changes applied.
  workingContact: Contact | null;
  setWorkingContact: (contact: Contact | null) => void;
  // Type-safe single-field update (replaces the per-field setter boilerplate).
  updateField: <K extends keyof Contact>(key: K, value: Contact[K]) => void;
}

export const useContactEditStore = create<ContactEditStore>((set, get) => ({
  workingContact: null,
  setWorkingContact: contact => set({ workingContact: contact }),
  updateField: (key, value) => {
    const current = get().workingContact;
    if (!current) return;
    set({ workingContact: { ...current, [key]: value } });
  },
}));

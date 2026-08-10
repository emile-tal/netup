import { Address, Contact, Email, FirstMeeting, Phone } from '../types/contacts';

import { create } from 'zustand';
import { newLocalId } from '../utils/id';

/** The contact fields that hold editable child rows. */
type CollectionKey = 'emails' | 'phones' | 'addresses';

type CollectionItem<K extends CollectionKey> = Contact[K][number];

/** Blank rows used when the user taps "add" on a collection. */
const blankItem: { [K in CollectionKey]: () => CollectionItem<K> } = {
  emails: (): Email => ({ id: newLocalId(), label: 'Email', email: '' }),
  phones: (): Phone => ({ id: newLocalId(), label: 'Mobile', phoneNumber: '' }),
  addresses: (): Address => ({ id: newLocalId(), label: 'Home' }),
};

/** An empty contact, used to seed the add-contact form. */
export function emptyContact(): Contact {
  return {
    id: '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    alumni: '',
    tier: null,
    source: '',
    notes: '',
    emails: [],
    phones: [],
    addresses: [],
    firstMeeting: { id: '', date: undefined, location: '' },
  };
}

interface ContactEditStore {
  // The contact being edited, with in-progress changes applied.
  workingContact: Contact | null;
  setWorkingContact: (contact: Contact | null) => void;
  // Type-safe single-field update (replaces the per-field setter boilerplate).
  updateField: <K extends keyof Contact>(key: K, value: Contact[K]) => void;
  // Child-collection editing. `addItem` appends a blank row with a client-side id; the
  // repo treats ids it doesn't recognize as inserts (see syncChildren in db/repo/contacts).
  addItem: (key: CollectionKey) => void;
  updateItem: <K extends CollectionKey>(
    key: K,
    id: string,
    changes: Partial<CollectionItem<K>>
  ) => void;
  removeItem: (key: CollectionKey, id: string) => void;
  updateFirstMeeting: (changes: Partial<FirstMeeting>) => void;
}

export const useContactEditStore = create<ContactEditStore>((set, get) => ({
  workingContact: null,
  setWorkingContact: contact => set({ workingContact: contact }),

  updateField: (key, value) => {
    const current = get().workingContact;
    if (!current) return;
    set({ workingContact: { ...current, [key]: value } });
  },

  addItem: key => {
    const current = get().workingContact;
    if (!current) return;
    set({
      workingContact: { ...current, [key]: [...current[key], blankItem[key]()] },
    });
  },

  updateItem: (key, id, changes) => {
    const current = get().workingContact;
    if (!current) return;
    set({
      workingContact: {
        ...current,
        [key]: current[key].map(item =>
          item.id === id ? { ...item, ...changes } : item
        ),
      },
    });
  },

  removeItem: (key, id) => {
    const current = get().workingContact;
    if (!current) return;
    set({
      workingContact: {
        ...current,
        [key]: current[key].filter(item => item.id !== id),
      },
    });
  },

  updateFirstMeeting: changes => {
    const current = get().workingContact;
    if (!current) return;
    set({
      workingContact: {
        ...current,
        firstMeeting: { ...current.firstMeeting, ...changes },
      },
    });
  },
}));

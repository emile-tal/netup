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

/**
 * An empty contact, used to seed the add-contact form.
 *
 * One blank row of each collection is included so the new-contact form opens with an
 * email, phone and address ready to type into — filling those in is the common case, and
 * having to press "add" first is a step for nothing. Rows left blank are dropped on save
 * by `withoutBlankChildren`.
 */
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
    emails: [blankItem.emails()],
    phones: [blankItem.phones()],
    addresses: [blankItem.addresses()],
    firstMeeting: { id: '', date: undefined, location: '' },
  };
}

const isBlankEmail = (email: Email) => !email.email.trim();
const isBlankPhone = (phone: Phone) => !phone.phoneNumber.trim();
const isBlankAddress = (address: Address) =>
  ![address.street, address.city, address.state, address.zip, address.country].some(part =>
    part?.trim()
  );

/**
 * Drops child rows the user never filled in, so an untouched blank row is not persisted.
 *
 * Applied on save by both the add and edit screens. A row whose content is cleared is
 * blank by the same test, and `syncChildren` reads its absence as a deletion — which is
 * what clearing a field should mean.
 */
export function withoutBlankChildren(contact: Contact): Contact {
  return {
    ...contact,
    emails: contact.emails.filter(email => !isBlankEmail(email)),
    phones: contact.phones.filter(phone => !isBlankPhone(phone)),
    addresses: contact.addresses.filter(address => !isBlankAddress(address)),
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

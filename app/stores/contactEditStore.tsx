import { Address, Contact, Email, FirstMeeting, Phone } from '../types/contacts';

import { create } from 'zustand';
import { newLocalId } from '../utils/id';

/** The contact fields that hold editable child rows. */
type CollectionKey = 'emails' | 'phones' | 'addresses';

type CollectionItem<K extends CollectionKey> = Contact[K][number];

/** The blank trailing row each collection keeps — see `withTrailingBlanks`. */
const blankItem: { [K in CollectionKey]: () => CollectionItem<K> } = {
  emails: (): Email => ({ id: newLocalId(), label: 'Email', email: '' }),
  phones: (): Phone => ({ id: newLocalId(), label: 'Mobile', phoneNumber: '' }),
  addresses: (): Address => ({ id: newLocalId(), label: 'Home' }),
};

/**
 * An empty contact, used to seed the add-contact form.
 *
 * `firstMeeting.date` starts **empty**, not at today. The picker opens on today and marks
 * it, which is the help a default was reaching for, but a date nobody chose should never
 * be saved — plenty of contacts are people you have not met. Rows left blank are dropped
 * on save by `withoutBlankChildren`.
 */
export function emptyContact(): Contact {
  return withTrailingBlanks({
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
  });
}

const isBlankEmail = (email: Email) => !email.email.trim();
const isBlankPhone = (phone: Phone) => !phone.phoneNumber.trim();
const isBlankAddress = (address: Address) =>
  ![address.street, address.city, address.state, address.zip, address.country].some(part =>
    part?.trim()
  );

/** Is this row still untouched? One test per collection, used by both rules below. */
const isBlankItem: { [K in CollectionKey]: (item: CollectionItem<K>) => boolean } = {
  emails: isBlankEmail,
  phones: isBlankPhone,
  addresses: isBlankAddress,
};

const isLastBlank = <K extends CollectionKey>(key: K, rows: Contact[K]): boolean => {
  const last = rows[rows.length - 1];
  return !!last && isBlankItem[key](last as never);
};

/**
 * The invariant behind the "no add button" form: **emails and phones always end in one
 * blank row**, so there is always an empty input sitting under the last filled one to
 * type the next into. Addresses get exactly one row and never more — a contact holds a
 * single address for now.
 *
 * Applied on every mutation, so the trailing blank reappears as soon as the row above it
 * is filled in, and clearing or removing the only filled row leaves the placeholder
 * behind rather than an empty section. `withoutBlankChildren` strips them on save.
 */
function withTrailingBlanks(contact: Contact): Contact {
  return {
    ...contact,
    emails: isLastBlank('emails', contact.emails)
      ? contact.emails
      : [...contact.emails, blankItem.emails()],
    phones: isLastBlank('phones', contact.phones)
      ? contact.phones
      : [...contact.phones, blankItem.phones()],
    addresses:
      contact.addresses.length > 0 ? contact.addresses : [blankItem.addresses()],
  };
}

/** Can this row be removed? Only once it holds something — see `withTrailingBlanks`. */
export function isRemovableItem<K extends CollectionKey>(
  key: K,
  item: CollectionItem<K>
): boolean {
  return !isBlankItem[key](item as never);
}

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
  // Child-collection editing. Blank rows carry a client-side id; the repo treats ids it
  // doesn't recognize as inserts (see syncChildren in db/repo/contacts).
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
  setWorkingContact: contact =>
    set({ workingContact: contact && withTrailingBlanks(contact) }),

  updateField: (key, value) => {
    const current = get().workingContact;
    if (!current) return;
    set({ workingContact: { ...current, [key]: value } });
  },

  updateItem: (key, id, changes) => {
    const current = get().workingContact;
    if (!current) return;
    set({
      workingContact: withTrailingBlanks({
        ...current,
        [key]: current[key].map(item =>
          item.id === id ? { ...item, ...changes } : item
        ),
      }),
    });
  },

  removeItem: (key, id) => {
    const current = get().workingContact;
    if (!current) return;
    set({
      workingContact: withTrailingBlanks({
        ...current,
        [key]: current[key].filter(item => item.id !== id),
      }),
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

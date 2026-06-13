import { Contact } from '../types/contacts';
import { create } from 'zustand';

interface ContactEditStore {
  contact: Contact | null;
  setContact: (contact: Contact) => void;
  workingContact: Contact | null;
  setWorkingContact: (contact: Contact) => void;
  setFirstName: (fistName: string) => void;
  setLastName: (lastName: string) => void;
  setJobTitle: (jobTitle: string) => void;
  setCompany: (company: string) => void;
  setAlumni: (alumni: string) => void;
  setRelationshipStrength: (relationshipStrength: number) => void;
  setOutreachGoal: (outreachGoal: number) => void;
  setSource: (source: string) => void;
  setNotes: (notes: string) => void;
}

const useContactEditStore = create<ContactEditStore>((set, get) => ({
  contact: null,
  setContact: (contact: Contact) => set({ contact }),
  workingContact: null,
  setWorkingContact: (contact: Contact) => set({ workingContact: contact }),
  setFirstName: (firstName: string) =>
    set({ workingContact: { ...get().workingContact, firstName } }),
  setLastName: (lastName: string) =>
    set({ workingContact: { ...get().workingContact, lastName } }),
  setJobTitle: (jobTitle: string) =>
    set({ workingContact: { ...get().workingContact, jobTitle } }),
  setCompany: (company: string) =>
    set({ workingContact: { ...get().workingContact, company } }),
  setAlumni: (alumni: string) =>
    set({ workingContact: { ...get().workingContact, alumni } }),
  setRelationshipStrength: (relationshipStrength: number) =>
    set({ workingContact: { ...get().workingContact, relationshipStrength } }),
  setOutreachGoal: (outreachGoal: number) =>
    set({ workingContact: { ...get().workingContact, outreachGoal } }),
  setSource: (source: string) =>
    set({ workingContact: { ...get().workingContact, source } }),
  setNotes: (notes: string) =>
    set({ workingContact: { ...get().workingContact, notes } }),
}));

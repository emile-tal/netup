import { Reminder } from '../types/reminders';
import { create } from 'zustand';
import { myRemindersData } from '../placeholderData';

interface CalendarStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  agendaStartDate: Date;
  setAgendaStartDate: (date: Date) => void;
  agendaEndDate: Date;
  setAgendaEndDate: (date: Date) => void;
}

const useCalendarStore = create<CalendarStore>((set, get) => ({
  selectedDate: new Date(),
  reminders: myRemindersData,
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  setReminders: (reminders: Reminder[]) => set({ reminders }),
  agendaStartDate: new Date(),
  setAgendaStartDate: (date: Date) => set({ agendaStartDate: date }),
  agendaEndDate: new Date(),
  setAgendaEndDate: (date: Date) => set({ agendaEndDate: date }),
}));

export default useCalendarStore;

import { create } from 'zustand';

export type ToastTone = 'error' | 'success';

export interface Toast {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
}

/** Older toasts give way once this many are on screen. */
const MAX_TOASTS = 3;

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/**
 * The in-app notices drawn by `ToastHost`. Written through `notify()` in
 * `app/utils/alert`, which is callable from anywhere — a hook's `.catch`, not just a
 * component — so it lives in a store rather than a context.
 */
const useToastStore = create<ToastState>(set => ({
  toasts: [],
  show: toast =>
    set(state => {
      // A failing action retried in quick succession should not stack identical notices.
      const rest = state.toasts.filter(
        t => t.title !== toast.title || t.message !== toast.message
      );
      return { toasts: [...rest, { ...toast, id: nextId++ }].slice(-MAX_TOASTS) };
    }),
  dismiss: id => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

export default useToastStore;

import useToastStore, { type ToastTone } from '../stores/toastStore';

/**
 * Tells the user something happened outside the place they are looking — a background
 * write failed, a change went through. Drawn in our own surface by `ToastHost` on every
 * platform; never `window.alert` (which reads as a browser warning and blocks the page) or
 * `Alert.alert` (a no-op under react-native-web).
 *
 * **Inside a modal, don't use this** — set the modal's `error` instead (`ModalShell`). A
 * toast is drawn under an open modal, and an error belongs next to the action that failed.
 * Confirmations go through `app/components/ConfirmDialog`.
 */
export function notify(title: string, message?: string, tone: ToastTone = 'error'): void {
  useToastStore.getState().show({ title, message, tone });
}

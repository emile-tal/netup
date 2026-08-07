import type { ConfirmDestructiveOptions } from './alert';

/**
 * Web implementation — `Alert` from react-native is a no-op under react-native-web,
 * which would silently swallow every error message and destructive confirmation.
 */
export function notify(title: string, message?: string): void {
  window.alert([title, message].filter(Boolean).join('\n\n'));
}

export function confirmDestructive({
  title,
  message,
  onConfirm,
}: ConfirmDestructiveOptions): void {
  if (window.confirm([title, message].filter(Boolean).join('\n\n'))) {
    void onConfirm();
  }
}

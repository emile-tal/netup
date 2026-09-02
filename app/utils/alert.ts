import { Alert } from 'react-native';

/**
 * Native implementation. The web build resolves `alert.web.ts` instead, because
 * react-native-web leaves `Alert` unimplemented — keep both signatures identical.
 *
 * Confirmations are *not* here: they go through `app/components/ConfirmDialog`, which is
 * drawn in our own surface rather than the browser's chrome.
 */
export function notify(title: string, message?: string): void {
  Alert.alert(title, message);
}

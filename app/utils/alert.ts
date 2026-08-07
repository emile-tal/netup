import { Alert } from 'react-native';

export interface ConfirmDestructiveOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * Native implementation. The web build resolves `alert.web.ts` instead, because
 * react-native-web leaves `Alert` unimplemented — keep both signatures identical.
 */
export function notify(title: string, message?: string): void {
  Alert.alert(title, message);
}

export function confirmDestructive({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
}: ConfirmDestructiveOptions): void {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: () => void onConfirm() },
  ]);
}

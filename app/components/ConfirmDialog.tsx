import { Text } from 'react-native';

import Button from './Button';
import ModalShell from './ModalShell';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  /** Second line under the title — say what will actually happen. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Draws the confirm action in the danger colour. */
  destructive?: boolean;
  /** Disables both actions and swaps the confirm label while work is in flight. */
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The app's one confirmation dialog. It replaced a `window.confirm`-backed helper, which
 * could not be styled and read as a browser warning rather than as part of the app.
 * Follows the modal shape established by AddReminderModal.
 */
const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  busy,
  busyLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <ModalShell
      visible={visible}
      // Not while the action is running, or the dialog would vanish with the work still
      // in flight.
      onRequestClose={busy ? undefined : onCancel}
      title={title}
      footer={
        <>
          <Button
            label={cancelLabel}
            variant='ghost'
            onPress={onCancel}
            disabled={busy}
          />
          <Button
            label={busy ? (busyLabel ?? confirmLabel) : confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            disabled={busy}
          />
        </>
      }
    >
      {message && (
        <Text className='mt-2 text-[14px] leading-6 text-ink-muted'>{message}</Text>
      )}
    </ModalShell>
  );
};

export default ConfirmDialog;

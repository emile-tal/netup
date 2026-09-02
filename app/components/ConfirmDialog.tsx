import { Modal, Pressable, Text, View } from 'react-native';

import Button from './Button';

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
    <Modal
      visible={visible}
      onRequestClose={onCancel}
      animationType='fade'
      transparent
      presentationStyle='overFullScreen'
    >
      <View className='flex-1 items-center justify-center bg-black/40 p-5'>
        {/* Tapping outside cancels — but not while the action is running, or the dialog
            would vanish with the work still in flight. */}
        <Pressable
          accessibilityLabel='Dismiss'
          onPress={busy ? undefined : onCancel}
          className='absolute inset-0'
        />
        <View className='w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6'>
          <Text className='text-[18px] font-bold text-ink'>{title}</Text>
          {message && (
            <Text className='mt-2 text-[14px] leading-6 text-ink-muted'>{message}</Text>
          )}
          <View className='mt-6 flex-row justify-end gap-2'>
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
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;

import { Modal, Pressable, Text, View } from 'react-native';

interface ModalShellProps {
  visible: boolean;
  /**
   * Backdrop tap and the Android back button. Omit it to make the modal undismissible —
   * which is what a dialog wants while its action is in flight.
   */
  onRequestClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Actions, laid out in a right-aligned row below the content. */
  footer?: React.ReactNode;
}

/**
 * The app's one modal surface: dimmed backdrop, centred panel, title, content, actions.
 *
 * Every modal in the app used to hand-roll this identical markup. The shell adds **no
 * spacing** between the title and the content on purpose — each caller keeps its own top
 * margin on its content root, which is what made extracting this pixel-identical.
 */
const ModalShell = ({
  visible,
  onRequestClose,
  title,
  children,
  footer,
}: ModalShellProps) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      animationType='fade'
      transparent
      presentationStyle='overFullScreen'
    >
      <View className='flex-1 items-center justify-center bg-black/40 p-5'>
        {onRequestClose && (
          <Pressable
            accessibilityLabel='Dismiss'
            onPress={onRequestClose}
            className='absolute inset-0'
          />
        )}
        <View className='w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6'>
          {title && <Text className='font-nunito text-[21px] text-ink'>{title}</Text>}
          {children}
          {footer && <View className='mt-6 flex-row justify-end gap-2'>{footer}</View>}
        </View>
      </View>
    </Modal>
  );
};

export default ModalShell;

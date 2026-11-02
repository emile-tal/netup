import { Pressable, Text, View } from 'react-native';
import useToastStore, { type Toast as ToastData } from '../stores/toastStore';

import { useEffect } from 'react';
import XIcon from '../icons/XIcon';
import { colors } from '../theme';

/** Long enough to read two lines; an error gets longer, since it may need acting on. */
const DURATION_MS = { error: 7000, success: 4000 } as const;

const DOT = { error: 'bg-error', success: 'bg-success' } as const;

/** One notice in `ToastHost`: a tone dot, the title, an optional line, and a close x. */
const Toast = ({ toast }: { toast: ToastData }) => {
  const dismiss = useToastStore(s => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), DURATION_MS[toast.tone]);
    return () => clearTimeout(timer);
  }, [toast.id, toast.tone, dismiss]);

  return (
    <View
      accessibilityRole='alert'
      accessibilityLiveRegion={toast.tone === 'error' ? 'assertive' : 'polite'}
      className='w-full flex-row items-start gap-3 rounded-2xl border border-line bg-surface py-3 pl-4 pr-2'
      style={{
        // Floats over the page, like the `@` popup (components/mentions/MentionList).
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <View className={`mt-[7px] h-2 w-2 rounded-full ${DOT[toast.tone]}`} />
      <View className='min-w-0 flex-1 gap-0.5'>
        <Text className='font-nunito text-[15px] text-ink'>{toast.title}</Text>
        {toast.message && (
          <Text className='font-nunito text-[13px] leading-5 text-ink-muted'>
            {toast.message}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Dismiss'
        onPress={() => dismiss(toast.id)}
        className='h-7 w-7 items-center justify-center rounded-full hover:bg-grey-light'
      >
        <XIcon size={14} color={colors.inkSubtle} />
      </Pressable>
    </View>
  );
};

export default Toast;

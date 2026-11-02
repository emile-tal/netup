import Toast from './Toast';
import { View } from 'react-native';
import { useIsDesktop } from '../hooks/useLayoutMode';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useToastStore from '../stores/toastStore';

/** Clears the mobile bottom nav, so a notice never covers the tabs. */
const MOBILE_NAV_CLEARANCE = 72;

/**
 * Draws `notify()`'s notices over the whole app, bottom-centre. Mounted once in the root
 * layout, inside `SafeAreaProvider` and above every route, so a notice raised just before
 * a navigation survives it. `box-none` keeps the empty overlay from eating taps.
 */
const ToastHost = () => {
  const toasts = useToastStore(s => s.toasts);
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents='box-none'
      className='absolute inset-x-0 items-center px-4'
      style={{ bottom: isDesktop ? 24 : insets.bottom + MOBILE_NAV_CLEARANCE }}
    >
      <View pointerEvents='box-none' className='w-full max-w-[420px] gap-2'>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </View>
    </View>
  );
};

export default ToastHost;

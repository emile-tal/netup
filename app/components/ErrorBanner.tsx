import { Text, View } from 'react-native';

interface ErrorBannerProps {
  message: string;
}

/**
 * A failure explained in place: the `error` wash with `error-dark` ink. Forms and modals
 * draw this next to the action that failed rather than raising a notice elsewhere.
 */
const ErrorBanner = ({ message }: ErrorBannerProps) => (
  <View
    accessibilityRole='alert'
    accessibilityLiveRegion='polite'
    className='rounded-xl bg-error-lighter px-3 py-2.5'
  >
    <Text className='font-nunito text-[13px] leading-5 text-error-dark'>{message}</Text>
  </View>
);

export default ErrorBanner;

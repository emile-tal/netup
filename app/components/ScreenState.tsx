import { ActivityIndicator, Text, View } from 'react-native';

import Button from './Button';
import { colors } from '../theme';

interface ScreenStateProps {
  loading?: boolean;
  error?: Error | null;
  /** Shown when there is no error and nothing loaded. */
  emptyMessage?: string;
  /** Second line under the empty message, e.g. how to create the first item. */
  emptyHint?: string;
  onRetry?: () => void;
}

/**
 * The one place loading / failure / empty are rendered, so screens don't each invent
 * their own (and so failures stop being console-only).
 */
const ScreenState = ({
  loading,
  error,
  emptyMessage,
  emptyHint,
  onRetry,
}: ScreenStateProps) => {
  if (loading) {
    return (
      <View className='flex-1 items-center justify-center py-16'>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center gap-2 px-6 py-16'>
        <Text className='text-[16px] font-semibold text-ink'>Something went wrong</Text>
        <Text className='text-center text-[14px] leading-6 text-ink-muted'>
          {error.message}
        </Text>
        {onRetry && (
          <View className='mt-3'>
            <Button label='Try again' variant='secondary' onPress={onRetry} />
          </View>
        )}
      </View>
    );
  }

  if (emptyMessage) {
    return (
      <View className='flex-1 items-center justify-center gap-1.5 px-6 py-16'>
        <Text className='text-[16px] font-semibold text-ink'>{emptyMessage}</Text>
        {emptyHint && (
          <Text className='text-center text-[14px] leading-6 text-ink-subtle'>
            {emptyHint}
          </Text>
        )}
      </View>
    );
  }

  return null;
};

export default ScreenState;

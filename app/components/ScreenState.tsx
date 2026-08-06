import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface ScreenStateProps {
  loading?: boolean;
  error?: Error | null;
  /** Shown when there is no error and nothing loaded. */
  emptyMessage?: string;
  onRetry?: () => void;
}

/**
 * The one place loading / failure / empty are rendered, so screens don't each invent
 * their own (and so failures stop being console-only).
 */
const ScreenState = ({ loading, error, emptyMessage, onRetry }: ScreenStateProps) => {
  if (loading) {
    return (
      <View className='py-8 items-center'>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className='py-8 items-center gap-2'>
        <Text className='text-base text-red-500'>Something went wrong.</Text>
        <Text className='text-sm text-gray-500 text-center'>{error.message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} className='py-2'>
            <Text className='text-base text-blue-500'>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (emptyMessage) {
    return (
      <View className='py-8 items-center'>
        <Text className='text-base text-gray-500'>{emptyMessage}</Text>
      </View>
    );
  }

  return null;
};

export default ScreenState;

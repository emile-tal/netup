import ScreenState from './ScreenState';
import { View } from 'react-native';

/**
 * The whole-window spinner the app shows before it knows which screen to render.
 *
 * Extracted so the auth-session read and the first-download check render the *same*
 * element — they run back to back on a cold launch, and two separately-built spinners
 * would flicker between them.
 */
const FullScreenLoader = () => (
  <View className='flex-1 bg-surface-muted'>
    <ScreenState loading />
  </View>
);

export default FullScreenLoader;

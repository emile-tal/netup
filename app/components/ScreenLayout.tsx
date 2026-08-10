import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useIsWideLayout } from '../hooks/useIsWideLayout';

interface ScreenLayoutProps {
  children: React.ReactNode;
  /** `wide` is for the calendar grid; everything else reads best as one column. */
  width?: 'content' | 'wide';
  /** Drops the horizontal padding so a child can bleed to the screen edge. */
  flush?: boolean;
}

/**
 * Standard screen chrome: page background, safe area, and the centred max-width column
 * every screen shares. The column is `self-center`, i.e. auto margins, so content stays
 * centred on a desktop viewport while filling a phone.
 */
const ScreenLayout = ({ children, width = 'content', flush }: ScreenLayoutProps) => {
  const isWide = useIsWideLayout();

  return (
    <SafeAreaView
      className='flex-1 bg-surface-muted'
      // The nav owns the inset on whichever edge it occupies: the bottom bar pads the
      // bottom, the left rail pads the left.
      edges={isWide ? ['top', 'right', 'bottom'] : ['top', 'left', 'right']}
    >
      <View
        className={`w-full flex-1 self-center ${flush ? '' : 'px-4 md:px-8'} ${
          width === 'wide' ? 'max-w-wide' : 'max-w-content'
        }`}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ScreenLayout;

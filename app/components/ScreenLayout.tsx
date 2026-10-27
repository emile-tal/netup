import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useContext } from 'react';
import { useIsDesktop } from '../hooks/useLayoutMode';

interface ScreenLayoutProps {
  children: React.ReactNode;
  /**
   * The screen's `PageToolbar` (back control, actions, search field). Rendered at the top
   * of the column and outside the scrolling content, so it stays put while a list scrolls.
   */
  toolbar?: React.ReactNode;
  /** `wide` is the app's page width; `content` is the narrow column auth/onboarding use. */
  width?: 'content' | 'wide';
  /** Drops the horizontal padding so a child can bleed to the screen edge. */
  flush?: boolean;
}

/**
 * Standard screen chrome: page background, safe area, and the centred max-width column
 * every screen shares. The column is `self-center`, i.e. auto margins, so content stays
 * centred on a desktop viewport while filling a phone.
 */
const ScreenLayout = ({ children, toolbar, width = 'wide', flush }: ScreenLayoutProps) => {
  const isDesktop = useIsDesktop();
  // Only the tab navigator provides this, so it tells a tab page from the signed-out and
  // first-run screens, which have no nav to share the safe area with.
  const inTabs = useContext(BottomTabBarHeightContext) !== undefined;
  const column = `w-full self-center ${flush ? '' : 'px-4 md:px-8'} ${
    width === 'wide' ? 'max-w-wide' : 'max-w-content'
  }`;

  return (
    <SafeAreaView
      className='flex-1 bg-surface-muted'
      // The nav owns the inset on whichever edge it occupies: the top bar pads the top on
      // desktop, the bottom bar pads the bottom on mobile.
      edges={
        !inTabs
          ? ['top', 'left', 'right', 'bottom']
          : isDesktop
            ? ['left', 'right', 'bottom']
            : ['top', 'left', 'right']
      }
    >
      <View className={`flex-1 ${inTabs ? 'pt-3 md:pt-6' : ''} ${column}`}>
        {toolbar && <View className='pb-3'>{toolbar}</View>}
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ScreenLayout;

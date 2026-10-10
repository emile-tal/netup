import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useIsWideLayout } from '../hooks/useIsWideLayout';

interface ScreenLayoutProps {
  children: React.ReactNode;
  /**
   * The screen's `Header` (plus anything that belongs in the same white bar, e.g. the
   * contacts search field). Rendered full-bleed on a white ground, with its contents
   * aligned to the same centred column as `children`, so every page's title and actions
   * land in exactly the same place.
   */
  header?: React.ReactNode;
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
const ScreenLayout = ({ children, header, width = 'wide', flush }: ScreenLayoutProps) => {
  const isWide = useIsWideLayout();
  const insets = useSafeAreaInsets();
  const column = `w-full self-center ${flush ? '' : 'px-4 md:px-8'} ${
    width === 'wide' ? 'max-w-wide' : 'max-w-content'
  }`;

  return (
    <SafeAreaView
      className='flex-1 bg-surface-muted'
      // The nav owns the inset on whichever edge it occupies: the bottom bar pads the
      // bottom, the left rail pads the left. The top inset belongs to the white header
      // bar when there is one, so the status area reads as part of it.
      edges={
        header
          ? isWide
            ? ['right', 'bottom']
            : ['left', 'right']
          : isWide
            ? ['top', 'right', 'bottom']
            : ['top', 'left', 'right']
      }
    >
      {header && (
        <View
          className='w-full border-b border-line bg-surface'
          style={{ paddingTop: insets.top }}
        >
          <View className={column}>{header}</View>
        </View>
      )}
      {/* The gap under the header bar lives here, so no screen has to remember it. */}
      <View className={`flex-1 ${header ? 'pt-4' : ''} ${column}`}>{children}</View>
    </SafeAreaView>
  );
};

export default ScreenLayout;

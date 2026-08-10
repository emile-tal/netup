import { layout } from '../theme';
import { useWindowDimensions } from 'react-native';

/**
 * True at desktop widths, where the tab bar becomes a side rail and screens get roomier
 * padding. Backed by `useWindowDimensions` (not `Dimensions.get`) so a browser resize
 * re-renders — see §12 of CLAUDE.md.
 */
export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= layout.navBreakpoint;
}

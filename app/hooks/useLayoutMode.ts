import { layout } from '../theme';
import { useWindowDimensions } from 'react-native';

export type LayoutMode = 'mobile' | 'desktop';

/**
 * The app's one mobile/desktop switch: `desktop` at or above `layout.desktopBreakpoint`
 * (Tailwind's `md`), `mobile` below it. It is a width, not a platform — a narrow browser
 * window is mobile and a landscape tablet is desktop — so it agrees with the `md:` classes.
 * Backed by `useWindowDimensions` (not `Dimensions.get`) so a browser resize re-renders —
 * see §12 of CLAUDE.md.
 */
export function useLayoutMode(): LayoutMode {
  const { width } = useWindowDimensions();
  return width >= layout.desktopBreakpoint ? 'desktop' : 'mobile';
}

/** Shorthand for `useLayoutMode() === 'desktop'`. */
export function useIsDesktop(): boolean {
  return useLayoutMode() === 'desktop';
}

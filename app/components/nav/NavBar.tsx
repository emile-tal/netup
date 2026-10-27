import BottomNav from './BottomNav';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TopNav from './TopNav';
import { useIsDesktop } from '../../hooks/useLayoutMode';

/**
 * The app's nav. On mobile it is a bottom tab bar; on desktop a bar across the top. The
 * navigator is told where to put it via `tabBarPosition` in `app/(tabs)/_layout.tsx`,
 * which reads the same hook.
 */
const NavBar = (props: BottomTabBarProps) =>
  useIsDesktop() ? <TopNav {...props} /> : <BottomNav {...props} />;

export default NavBar;

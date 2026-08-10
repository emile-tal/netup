import BottomNav from './BottomNav';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import SideNav from './SideNav';
import { useIsWideLayout } from '../../hooks/useIsWideLayout';

/**
 * The app's tab bar. Below the `md` breakpoint it is a bottom bar; at desktop widths it
 * becomes a left rail. The navigator is told where to put it via `tabBarPosition` in
 * `app/(tabs)/_layout.tsx`, which reads the same breakpoint.
 */
const NavBar = (props: BottomTabBarProps) => {
  const isWide = useIsWideLayout();
  return isWide ? <SideNav {...props} /> : <BottomNav {...props} />;
};

export default NavBar;

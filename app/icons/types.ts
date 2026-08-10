import { colors } from '../theme';

/**
 * Every icon takes the same two props. NativeWind's `className` does not reach
 * react-native-svg's `fill` on native, so colour is passed explicitly rather than
 * through a utility class.
 */
export interface IconProps {
  /** Any colour string; defaults to the primary ink colour. */
  color?: string;
  /** Square size in px. */
  size?: number;
}

export const DEFAULT_ICON_SIZE = 24;
export const DEFAULT_ICON_COLOR = colors.ink;

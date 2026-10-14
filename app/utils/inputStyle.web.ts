import type { StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme';

/**
 * Web half of `noFocusRing` — react-native-web maps `outlineStyle` onto the DOM node.
 * It isn't part of React Native's `TextStyle`, hence the cast.
 */
export const noFocusRing = { outlineStyle: 'none' } as unknown as StyleProp<TextStyle>;

/**
 * Web half of `mirroredInput`. Browsers take the caret colour from `color`, so with
 * transparent ink it has to be set explicitly. The scrollbar is hidden because it would
 * narrow the textarea's line box and wrap its text differently from the `Text` drawn
 * underneath it.
 */
export const mirroredInput = {
  caretColor: colors.ink,
  scrollbarWidth: 'none',
} as unknown as StyleProp<TextStyle>;

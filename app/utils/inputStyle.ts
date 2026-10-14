import type { StyleProp, TextStyle } from 'react-native';

/**
 * Applied to every TextInput. On web it removes the browser's default focus ring, which
 * fights the borders we draw ourselves; on native there is nothing to remove.
 * See §12 of CLAUDE.md for the `.web.ts` convention.
 */
export const noFocusRing: StyleProp<TextStyle> = undefined;

/**
 * For an input whose ink is transparent because a styled `Text` underneath draws the
 * glyphs (`MentionTextInput`). Native takes its caret colour from props, not the text
 * colour, so there is nothing to add here.
 */
export const mirroredInput: StyleProp<TextStyle> = undefined;

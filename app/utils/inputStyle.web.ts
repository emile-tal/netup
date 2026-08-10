import type { StyleProp, TextStyle } from 'react-native';

/**
 * Web half of `noFocusRing` — react-native-web maps `outlineStyle` onto the DOM node.
 * It isn't part of React Native's `TextStyle`, hence the cast.
 */
export const noFocusRing = { outlineStyle: 'none' } as unknown as StyleProp<TextStyle>;

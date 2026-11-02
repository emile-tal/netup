import type { RefObject } from 'react';
import type { View } from 'react-native';

export interface FileDrop {
  /** Whether files can be dragged in at all — false on native, which has no drag source. */
  supported: boolean;
  /** True while files are being dragged over the target. */
  dragging: boolean;
}

/**
 * Lets the user drop files onto `target`. Native has nothing to drop, so this half is
 * inert; see `useFileDrop.web.ts`. Keep both signatures identical (CLAUDE.md §12).
 */
export function useFileDrop(
  _target: RefObject<View | null>,
  _onDrop: (files: File[]) => void,
  _enabled = true
): FileDrop {
  return { supported: false, dragging: false };
}

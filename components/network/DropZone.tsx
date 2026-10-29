import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import type { Rect } from './board';

interface DropZoneProps {
  zoneKey: string;
  /** `null` when the zone unmounts, so a hidden zone can't keep catching drops. */
  onMeasure: (zoneKey: string, rect: Rect | null) => void;
  /**
   * Re-measures whenever this changes. `onLayout` doesn't fire when the page scrolls, so
   * the board bumps it at the start of each drag to catch rects the scroll has moved.
   */
  measureSignal?: unknown;
  /**
   * Lifts the whole zone above its siblings. A chip's own `zIndex` only orders it within
   * its parent, so without this a chip dragged rightward would slide *under* the next
   * column.
   */
  elevated?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reports its own position in **window** coordinates whenever it lays out. A pan gesture
 * reports the finger in window coordinates too, so this is what lets the board hit-test a
 * drop without any column knowing where the others are.
 *
 * `onLayout` fires on resize as well as mount, so the rects stay correct through a browser
 * resize or a device rotation — the reason this measures rather than deriving positions
 * from the window size (CLAUDE.md §12).
 */
const DropZone = ({
  zoneKey,
  onMeasure,
  measureSignal,
  elevated,
  className,
  children,
}: DropZoneProps) => {
  const ref = useRef<View>(null);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      onMeasure(zoneKey, { x, y, width, height });
    });
  }, [zoneKey, onMeasure]);

  useEffect(() => {
    if (measureSignal) measure();
  }, [measureSignal, measure]);

  useEffect(() => () => onMeasure(zoneKey, null), [zoneKey, onMeasure]);

  return (
    <View
      ref={ref}
      onLayout={measure}
      className={className}
      style={elevated ? { zIndex: 30, elevation: 30 } : undefined}
    >
      {children}
    </View>
  );
};

export default DropZone;

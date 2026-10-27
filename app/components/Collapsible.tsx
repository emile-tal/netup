import { Animated, Easing, View } from 'react-native';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const DURATION_MS = 220;

interface CollapsibleProps {
  open: boolean;
  /** Fires once a close has finished, so the caller can unmount the content. */
  onClosed?: () => void;
  children: ReactNode;
}

/**
 * Unfolds its children by animating their height from 0 to their measured height, and
 * folds them back. Plain `Animated` on the JS driver (height can't use the native one),
 * so it behaves the same on native and web; `LayoutAnimation` is a no-op on web.
 *
 * The animated height and the clipping only apply *while moving*. Once open it lets go of
 * both, so the content can grow (a new row, an auto-growing field) without being cut off,
 * and a popup it renders (the `@` menu, §21) isn't clipped by this box.
 */
const Collapsible = ({ open, onClosed, children }: CollapsibleProps) => {
  const height = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const [measured, setMeasured] = useState(false);
  const [settled, setSettled] = useState(false);
  const settledRef = useRef(false);

  // Read through a ref so a new callback identity doesn't restart the animation.
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  const settle = useCallback((value: boolean) => {
    settledRef.current = value;
    setSettled(value);
  }, []);

  useEffect(() => {
    // The first open has to wait for the content to report its height.
    if (open && !measured) return;

    // Coming off the auto height, the animated value is stale: start from what's on screen.
    if (settledRef.current) height.setValue(contentHeight.current);
    settle(false);

    const animation = Animated.timing(height, {
      toValue: open ? contentHeight.current : 0,
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (!finished) return;
      if (open) settle(true);
      else onClosedRef.current?.();
    });
    // A toggle mid-flight stops this one, and the next starts from wherever it got to.
    return () => animation.stop();
  }, [open, measured, height, settle]);

  return (
    <Animated.View style={settled ? undefined : { height, overflow: 'hidden' }}>
      <View
        onLayout={event => {
          contentHeight.current = event.nativeEvent.layout.height;
          if (!measured) setMeasured(true);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
};

export default Collapsible;

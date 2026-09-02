import { Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useMemo, useRef, useState } from 'react';

import ContactChip from './ContactChip';
import type { ContactSummary } from '@/app/types/contacts';

interface DraggableChipProps {
  contact: ContactSummary;
  /** Window coordinates of the finger when the drag ended — the board hit-tests them. */
  onDrop: (contactId: string, x: number, y: number) => void;
  /** Lets the board lift the column this chip is leaving, so it isn't painted over. */
  onDragStart: (contactId: string) => void;
  /** Called on every move so the board can highlight the column being hovered. */
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
}

/** How long to hold before the chip lifts, leaving shorter drags to scroll the page. */
const LIFT_DELAY_MS = 200;

/**
 * A board chip that can be dragged between columns on native.
 *
 * Uses `react-native-gesture-handler` rather than a bare `PanResponder` for
 * `activateAfterLongPress`: the board sits inside a vertical scroll view, and a press-and-
 * hold is the only activation that doesn't have to guess whether a drag was meant to move
 * the contact or scroll the page. `runOnJS` keeps the whole gesture on the JS thread, so
 * this needs no reanimated worklets — the movement is a plain `Animated.ValueXY`.
 */
const DraggableChip = ({
  contact,
  onDrop,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableChipProps) => {
  const [dragging, setDragging] = useState(false);
  const offset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(LIFT_DELAY_MS)
        .runOnJS(true)
        .onStart(() => {
          setDragging(true);
          onDragStart(contact.id);
        })
        .onUpdate(event => {
          offset.setValue({ x: event.translationX, y: event.translationY });
          onDragMove(event.absoluteX, event.absoluteY);
        })
        .onEnd(event => onDrop(contact.id, event.absoluteX, event.absoluteY))
        // Runs after onEnd, and also when the gesture is cancelled, so the chip always
        // snaps home and the board always clears its highlight.
        .onFinalize(() => {
          setDragging(false);
          offset.setValue({ x: 0, y: 0 });
          onDragEnd();
        }),
    [contact.id, offset, onDrop, onDragStart, onDragMove, onDragEnd]
  );

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={{
          transform: offset.getTranslateTransform(),
          // Lifts the chip above its neighbours; the columns draw no clipping bounds, so
          // it stays visible all the way across the board.
          zIndex: dragging ? 20 : 0,
          elevation: dragging ? 20 : 0,
          opacity: dragging ? 0.95 : 1,
        }}
      >
        <ContactChip contact={contact} dragging={dragging} />
      </Animated.View>
    </GestureDetector>
  );
};

export default DraggableChip;

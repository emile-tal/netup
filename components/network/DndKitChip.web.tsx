import { useDraggable } from '@dnd-kit/core';

import ContactChip from './ContactChip';
import type { ContactSummary } from '@/db/repo/contacts';

interface DndKitChipProps {
  contact: ContactSummary;
}

/**
 * A board chip that can be dragged on web.
 *
 * Only `TierBoard.web.tsx` imports this, so Metro never pulls dnd-kit into a native
 * bundle. It is not named `DraggableChip.web.tsx` on purpose: that would make it a
 * platform pair with the native `DraggableChip`, and §12 pairs must share a signature —
 * these two don't, because dnd-kit resolves the drop itself while the native chip has to
 * report coordinates back to the board.
 *
 * The wrapper is a `div` because dnd-kit's `listeners` are DOM event props and
 * `setNodeRef` wants a DOM node; react-native-web's `View` forwards neither.
 */
const DndKitChip = ({ contact }: DndKitChipProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: contact.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        // The overlay draws the chip that follows the cursor, so the original only fades
        // in place — no transform of its own.
        transform: transform ? 'none' : undefined,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <ContactChip contact={contact} />
    </div>
  );
};

export default DndKitChip;

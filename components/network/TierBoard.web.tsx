import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { View } from 'react-native';

import { TIERS } from '@/app/utils/outreach';
import type { TierBoardProps } from './board';
import { POOL_CHIP_WIDTH, dropZoneTarget } from './board';
import ContactChip from './ContactChip';
import DndKitChip from './DndKitChip.web';
import DndKitColumn from './DndKitColumn.web';
import EmptyColumnHint from './EmptyColumnHint';

/**
 * The web 5-15-50 board, on dnd-kit.
 *
 * This file is why the whole board lives in `components/` instead of `app/components/`:
 * expo-router's `require.context` bundles *every* file under `app/`, platform suffix or
 * not, so a `TierBoard.web.tsx` there would drag dnd-kit and react-dom into the native
 * bundle. A platform suffix decides which file wins an import; it does not exclude a file
 * from the router's sweep. See CLAUDE.md §12.
 *
 * Metro picks this file over `TierBoard.tsx` on web (CLAUDE.md §12); the two take the same
 * `TierBoardProps` and render the same `TierColumn`/`ContactChip`. dnd-kit resolves the
 * drop itself, so none of the native board's coordinate measuring is needed here, and
 * `DragOverlay` draws the chip that follows the cursor.
 */
const TierBoard = ({ buckets, onMove, onOpen }: TierBoardProps) => {
  // The distance constraint keeps a click on a chip a click, not a 0px drag. The keyboard
  // sensor is what makes the announcements dnd-kit already renders actually usable —
  // space to lift, arrows to move, space to drop.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // The overlay needs the dragged contact, and dnd-kit only reports its id.
  const byId = useMemo(() => {
    const all = [...buckets.unassigned, ...TIERS.flatMap(tier => buckets.byTier[tier])];
    return new Map(all.map(contact => [contact.id, contact]));
  }, [buckets]);

  const handleDragStart = (event: DragStartEvent) =>
    setDraggingId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    if (!event.over) return;
    const target = dropZoneTarget(String(event.over.id));
    // `null` is a real target (the unassigned pool), so only `undefined` means "nowhere".
    if (target === undefined) return;
    onMove(String(event.active.id), target);
  };

  const dragging = draggingId ? byId.get(draggingId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingId(null)}
    >
      <View className='gap-3 md:gap-4'>
        {/* The pool leads, and only while it has someone in it (see TierBoard.tsx). */}
        {buckets.unassigned.length > 0 && (
          <DndKitColumn target={null} count={buckets.unassigned.length}>
            <View className='flex-row flex-wrap gap-2'>
              {buckets.unassigned.map(contact => (
                <View key={contact.id} className={POOL_CHIP_WIDTH}>
                  <DndKitChip contact={contact} onOpen={onOpen} />
                </View>
              ))}
            </View>
          </DndKitColumn>
        )}
        <View className='flex-row gap-2 md:gap-4'>
          {TIERS.map(tier => (
            <DndKitColumn key={tier} target={tier} count={buckets.byTier[tier].length}>
              {buckets.byTier[tier].length === 0 ? (
                <EmptyColumnHint />
              ) : (
                buckets.byTier[tier].map(contact => (
                  <DndKitChip key={contact.id} contact={contact} onOpen={onOpen} />
                ))
              )}
            </DndKitColumn>
          ))}
        </View>
      </View>
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {dragging ? <ContactChip contact={dragging} dragging /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default TierBoard;

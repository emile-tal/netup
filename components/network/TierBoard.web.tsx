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
import { Text, View } from 'react-native';

import { TIERS } from '@/app/utils/outreach';
import type { ContactSummary } from '@/app/types/contacts';
import type { TierBoardProps } from './board';
import { dropZoneTarget } from './board';
import ContactChip from './ContactChip';
import DndKitChip from './DndKitChip.web';
import DndKitColumn from './DndKitColumn.web';

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
const TierBoard = ({ buckets, onMove }: TierBoardProps) => {
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

  const renderChips = (contacts: ContactSummary[], emptyHint: string) => {
    if (contacts.length === 0) {
      return (
        <Text className='px-1 py-3 text-center text-[11px] text-ink-subtle'>
          {emptyHint}
        </Text>
      );
    }
    return contacts.map(contact => <DndKitChip key={contact.id} contact={contact} />);
  };

  const dragging = draggingId ? byId.get(draggingId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingId(null)}
    >
      <View className='gap-3'>
        <View className='flex-row gap-2'>
          {TIERS.map(tier => (
            <DndKitColumn key={tier} target={tier} count={buckets.byTier[tier].length}>
              {renderChips(buckets.byTier[tier], 'Drag someone here')}
            </DndKitColumn>
          ))}
        </View>
        <DndKitColumn target={null} count={buckets.unassigned.length}>
          <View className='flex-row flex-wrap gap-1.5'>
            {buckets.unassigned.length === 0 ? (
              <Text className='px-1 py-3 text-[11px] text-ink-subtle'>
                Everyone is in a circle.
              </Text>
            ) : (
              buckets.unassigned.map(contact => (
                <View key={contact.id} className='w-[31%]'>
                  <DndKitChip contact={contact} />
                </View>
              ))
            )}
          </View>
        </DndKitColumn>
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

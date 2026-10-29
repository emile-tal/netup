import { View } from 'react-native';
import { useCallback, useRef, useState } from 'react';

import DraggableChip from './DraggableChip';
import DropZone from './DropZone';
import EmptyColumnHint from './EmptyColumnHint';
import TierColumn from './TierColumn';
import type { ContactSummary } from '@/app/types/contacts';
import type { DropTarget, Rect, TierBoardProps } from './board';
import { POOL_CHIP_WIDTH, dropZoneKey, hitTest } from './board';
import { TIERS } from '@/app/utils/outreach';

/**
 * The native 5-15-50 board.
 *
 * Drop targets are *measured* (`DropZone` → `measureInWindow`) rather than derived from the
 * window, and the pan gesture reports the finger in the same window coordinates, so a
 * single `hitTest` resolves a drop at any column width or orientation. The web build swaps
 * this file for `TierBoard.web.tsx`, which hands the same job to dnd-kit; both take
 * `TierBoardProps` and render the same `TierColumn`/`ContactChip`.
 */
const TierBoard = ({ buckets, onMove, onOpen }: TierBoardProps) => {
  const zones = useRef(new Map<string, Rect>()).current;
  // `undefined` means "over no zone at all"; `null` is a real target (unassigned).
  const [hovered, setHovered] = useState<DropTarget | undefined>(undefined);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const registerZone = useCallback(
    (key: string, rect: Rect | null) => {
      if (rect) zones.set(key, rect);
      else zones.delete(key);
    },
    [zones]
  );

  const handleDragStart = useCallback((contactId: string) => setDraggingId(contactId), []);

  const handleDragMove = useCallback(
    (x: number, y: number) => {
      const target = hitTest(zones, x, y);
      // The gesture fires every frame; only re-render when the answer changes.
      setHovered(current => (current === target ? current : target));
    },
    [zones]
  );

  const handleDragEnd = useCallback(() => {
    setHovered(undefined);
    setDraggingId(null);
  }, []);

  const handleDrop = useCallback(
    (contactId: string, x: number, y: number) => {
      const target = hitTest(zones, x, y);
      if (target === undefined) return;
      onMove(contactId, target);
    },
    [zones, onMove]
  );

  const renderChip = (contact: ContactSummary) => (
    <DraggableChip
      key={contact.id}
      contact={contact}
      onDrop={handleDrop}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onPress={onOpen}
    />
  );

  const holdsDragged = (contacts: ContactSummary[]) =>
    !!draggingId && contacts.some(contact => contact.id === draggingId);

  return (
    <View className='gap-3 md:gap-4'>
      {/* The pool is the to-do list, so it leads — and it is only drawn while it has
          someone in it. `DropZone` unregisters itself on unmount, so a hidden pool
          can't keep catching drops. */}
      {buckets.unassigned.length > 0 && (
        <DropZone
          zoneKey={dropZoneKey(null)}
          onMeasure={registerZone}
          measureSignal={draggingId}
          elevated={holdsDragged(buckets.unassigned)}
        >
          <TierColumn
            target={null}
            count={buckets.unassigned.length}
            isOver={hovered === null}
          >
            <View className='flex-row flex-wrap gap-2'>
              {buckets.unassigned.map(contact => (
                <View
                  key={contact.id}
                  className={POOL_CHIP_WIDTH}
                  // Same sibling-stacking problem as the columns, one level down.
                  style={
                    draggingId === contact.id ? { zIndex: 30, elevation: 30 } : undefined
                  }
                >
                  {renderChip(contact)}
                </View>
              ))}
            </View>
          </TierColumn>
        </DropZone>
      )}
      <View className='flex-row gap-2 md:gap-4'>
        {TIERS.map(tier => (
          <DropZone
            key={tier}
            zoneKey={dropZoneKey(tier)}
            onMeasure={registerZone}
            measureSignal={draggingId}
            elevated={holdsDragged(buckets.byTier[tier])}
            className='flex-1'
          >
            <TierColumn
              target={tier}
              count={buckets.byTier[tier].length}
              isOver={hovered === tier}
            >
              {buckets.byTier[tier].length === 0 ? (
                <EmptyColumnHint />
              ) : (
                buckets.byTier[tier].map(renderChip)
              )}
            </TierColumn>
          </DropZone>
        ))}
      </View>
    </View>
  );
};

export default TierBoard;

import { useDroppable } from '@dnd-kit/core';

import TierColumn from './TierColumn';
import type { DropTarget } from './board';
import { dropZoneKey } from './board';

interface DndKitColumnProps {
  target: DropTarget;
  count: number;
  children: React.ReactNode;
}

/**
 * A board column that accepts drops on web. `useDroppable` is a hook, so every zone needs
 * its own component — see `DndKitChip` for why the wrapper is a `div`.
 */
const DndKitColumn = ({ target, count, children }: DndKitColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: dropZoneKey(target) });

  return (
    <div ref={setNodeRef} style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <TierColumn target={target} count={count} isOver={isOver}>
        {children}
      </TierColumn>
    </div>
  );
};

export default DndKitColumn;

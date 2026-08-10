import { Text, View } from 'react-native';

import type { DropTarget } from './board';
import { TIER_CADENCE_LABELS, TIER_LABELS, TIER_STYLES } from '@/app/utils/outreach';

interface TierColumnProps {
  /** `null` renders the unassigned pool, which has no target size or cadence. */
  target: DropTarget;
  count: number;
  /** Highlights the column while a contact is hovering over it. */
  isOver?: boolean;
  children: React.ReactNode;
}

/**
 * One column of the board: a coloured head naming the circle and its fill, over the chips.
 *
 * Notably *not* built on `Card` and not scrollable — `Card` clips its children, and a
 * dragged chip has to be able to travel out of the column it started in. The page scrolls
 * as one instead, so the columns grow with their contents.
 */
const TierColumn = ({ target, count, isOver, children }: TierColumnProps) => {
  const style = target ? TIER_STYLES[target] : null;

  return (
    <View
      className={`min-h-[160px] flex-1 rounded-2xl border ${
        isOver ? 'border-brand bg-brand-light' : 'border-line bg-surface-muted'
      }`}
    >
      <View className={`rounded-t-2xl px-2 py-2 ${style?.wash ?? 'bg-surface-sunken'}`}>
        <Text
          numberOfLines={2}
          className={`text-[11px] font-bold uppercase tracking-wide ${
            style?.text ?? 'text-ink-muted'
          }`}
        >
          {target ? TIER_LABELS[target] : 'Unassigned'}
        </Text>
        <Text className='mt-0.5 text-[15px] font-bold text-ink'>
          {/* `count/target` makes over- and under-filled circles obvious, which is the
              whole point of picking 5, 15 and 50 as the sizes. */}
          {target ? `${count}/${target}` : count}
        </Text>
        <Text numberOfLines={1} className='text-[10px] text-ink-subtle'>
          {target ? TIER_CADENCE_LABELS[target] : 'No reminders'}
        </Text>
      </View>
      <View className='gap-1.5 p-1.5'>{children}</View>
    </View>
  );
};

export default TierColumn;

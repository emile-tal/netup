import { Text, View } from 'react-native';

import type { DropTarget } from './board';
import {
  TIER_CADENCE_LABELS,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  TIER_STYLES,
} from '@/app/utils/outreach';

interface TierColumnProps {
  /** `null` renders the unassigned pool, which has no target size or cadence. */
  target: DropTarget;
  count: number;
  /** Highlights the column while a contact is hovering over it. */
  isOver?: boolean;
  children: React.ReactNode;
}

/**
 * One column of the board: a head naming the circle and what it is for, over the chips.
 *
 * The head carries the circle's colour as a `-light` wash with the label in the full tone,
 * so the three circles are identifiable at a glance and match the pill on a profile. The
 * wash stops at the head: the chip area stays paper, or twelve contacts on a tinted field
 * turn the board into a highlighter block.
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
      {/* Fixed head height: the label and the description wrap to different line counts
          per column at phone width, and without it the first chip in each column starts
          at a different y. */}
      <View
        className={`gap-0.5 rounded-t-2xl px-2 py-2 ${style?.wash ?? 'bg-surface-sunken'} ${
          target ? 'min-h-[112px] md:min-h-0' : ''
        }`}
      >
        <Text
          numberOfLines={2}
          className={`text-[11px] font-bold uppercase tracking-wide ${
            style?.text ?? 'text-ink-muted'
          }`}
        >
          {target ? TIER_LABELS[target] : 'Unassigned'}
        </Text>
        <Text className='text-[15px] font-bold text-ink'>
          {/* `count/target` makes over- and under-filled circles obvious, which is the
              whole point of picking 5, 15 and 50 as the sizes. */}
          {target ? `${count}/${target}` : count}
        </Text>
        <Text numberOfLines={3} className='text-[10px] leading-[13px] text-ink-muted'>
          {target ? TIER_DESCRIPTIONS[target] : 'Not in a circle yet.'}
        </Text>
        <Text numberOfLines={1} className='text-[10px] text-ink-muted'>
          {target ? TIER_CADENCE_LABELS[target] : 'No reminders'}
        </Text>
      </View>
      <View className='gap-1.5 p-1.5'>{children}</View>
    </View>
  );
};

export default TierColumn;

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
 * One region of the board: a head naming the circle, how full it is and how often it
 * wants contact, over the chips. What each circle is *for* lives in the info panel
 * (`TierInfoModal`), not here — repeated on every visit it was the board's noise.
 *
 * The head carries the circle's `-lighter` wash with the label in its `-darker` tone, so
 * the three circles are identifiable at a glance and match the pill on a profile. The
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
      className={`flex-1 rounded-2xl border ${target ? 'min-h-[200px]' : ''} ${
        isOver ? 'border-blue bg-blue-lighter' : 'border-line bg-surface-muted'
      }`}
    >
      <View
        className={`gap-0.5 rounded-t-2xl px-2.5 py-2.5 md:px-4 md:py-3 ${
          style?.wash ?? 'bg-grey-light'
        }`}
      >
        {/* Two lines reserved at phone width, where "Strategic network" wraps and "Inner
            circle" may not — otherwise the first chip in each column starts at a
            different y. */}
        <Text
          numberOfLines={2}
          className={`font-nunito text-[12px] uppercase leading-4 tracking-wide md:text-[13px] ${
            target ? 'min-h-[32px] md:min-h-0' : ''
          } ${style?.text ?? 'text-ink-muted'}`}
        >
          {target ? TIER_LABELS[target] : 'Unassigned'}
        </Text>
        {/* `count/target` makes over- and under-filled circles obvious, which is the
            whole point of picking 5, 15 and 50 as the sizes. */}
        <Text className='font-nunito text-[22px] leading-7 text-ink md:text-[26px] md:leading-8'>
          {target ? `${count}/${target}` : count}
        </Text>
        <Text numberOfLines={1} className='font-nunito text-[12px] text-ink-muted md:text-[13px]'>
          {target ? TIER_CADENCE_LABELS[target] : 'Drag into a circle to start outreach'}
        </Text>
      </View>
      <View className='gap-2 p-2 md:p-3'>{children}</View>
    </View>
  );
};

export default TierColumn;

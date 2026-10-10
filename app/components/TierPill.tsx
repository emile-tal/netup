import { Pressable, Text, View } from 'react-native';

import type { Tier } from '../types/contacts';
import { TIER_LABELS, TIER_STYLES } from '../utils/outreach';

interface TierPillProps {
  /** `null` renders the neutral "Unassigned" pill. */
  tier: Tier | null;
  /** Draws the pill filled — used by the tier picker for the current choice. */
  selected?: boolean;
  onPress?: () => void;
  /** Drops the label to just the circle's number, for a chip on the board. */
  compact?: boolean;
}

/**
 * A contact's 5-15-50 circle as a pill. The one place a tier is drawn, so the profile,
 * the board and the picker can't drift apart.
 */
const TierPill = ({ tier, selected, onPress, compact }: TierPillProps) => {
  const style = tier ? TIER_STYLES[tier] : null;
  const label = tier ? (compact ? String(tier) : TIER_LABELS[tier]) : 'Unassigned';

  const container = selected
    ? `${style?.fill ?? 'bg-grey-dark'} border-transparent`
    : `${style?.wash ?? 'bg-grey-light'} border-transparent`;
  // Black in both states: on the circle's own hue (every brand fill carries black ink)
  // and on its `-lighter` wash, where black is 18:1. One ink, so a picker of these reads
  // as one set of buttons rather than three different-coloured labels.
  const text = 'text-black';

  const content = (
    <View
      className={`self-start rounded-full border px-2.5 py-1 ${container}`}
      accessibilityRole={onPress ? undefined : 'text'}
    >
      <Text className={`font-nunito text-[12px] ${text}`}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='radio'
      // `checked`, not `selected` — a radio's state maps to aria-checked.
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={tier ? TIER_LABELS[tier] : 'Unassigned'}
      className='self-start'
    >
      {content}
    </Pressable>
  );
};

export default TierPill;

import { Text, View } from 'react-native';

import CardRow from './CardRow';
import type { Tier } from '../../types/contacts';
import TierPill from '../TierPill';
import { formatShortDate } from '../../utils/date';
import { TIERS, TIER_CADENCE_LABELS, TIER_DESCRIPTIONS } from '../../utils/outreach';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileTierCardProps {
  tier: Tier | null;
  /** Read-only: set by completing an outreach reminder, never typed in. */
  lastOutreachAt?: Date;
  editable?: boolean;
}

/**
 * The contact's 5-15-50 circle, plus the outreach state that follows from it. Editable as
 * a pick-one row rather than a text field, because the circle drives a generated reminder
 * cadence (`db/repo/outreach.ts`) and only the three values mean anything.
 */
const ProfileTierCard = ({ tier, lastOutreachAt, editable }: ProfileTierCardProps) => {
  const working = useContactEditStore(s => s.workingContact);
  const updateField = useContactEditStore(s => s.updateField);
  const current = editable ? (working?.tier ?? null) : tier;

  return (
    <>
      <CardRow label='Circle'>
        {editable ? (
          <View className='gap-1.5'>
            <View className='flex-row flex-wrap gap-2'>
              {[...TIERS, null].map(option => (
                <TierPill
                  key={option ?? 'none'}
                  tier={option}
                  selected={current === option}
                  onPress={() => updateField('tier', option)}
                />
              ))}
            </View>
            {/* What the picked circle means, so the choice isn't three bare numbers. */}
            {current && (
              <Text className='text-[13px] leading-[18px] text-ink-subtle'>
                {TIER_DESCRIPTIONS[current]}
              </Text>
            )}
          </View>
        ) : (
          <View className='gap-1'>
            <TierPill tier={current} />
            {current && (
              <>
                <Text className='text-[13px] leading-[18px] text-ink-muted'>
                  {TIER_DESCRIPTIONS[current]}
                </Text>
                <Text className='text-[13px] text-ink-subtle'>
                  {TIER_CADENCE_LABELS[current]}
                </Text>
              </>
            )}
          </View>
        )}
      </CardRow>
      {current && (
        <CardRow label='Last outreach'>
          <Text className='text-[15px] text-ink'>
            {lastOutreachAt ? formatShortDate(lastOutreachAt) : 'Not yet'}
          </Text>
        </CardRow>
      )}
    </>
  );
};

export default ProfileTierCard;

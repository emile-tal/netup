import { Text, View } from 'react-native';
import {
  TIERS,
  TIER_CADENCE_LABELS,
  TIER_DESCRIPTIONS,
  TIER_STYLES,
} from '../utils/outreach';

import Button from './Button';
import Checkbox from './Checkbox';
import ModalShell from './ModalShell';
import TierPill from './TierPill';
import { useEffect, useState } from 'react';

interface TierInfoModalProps {
  visible: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

/**
 * What the 5-15-50 model is, shown on the first visit to the board and reachable
 * afterwards from the info button in the header.
 *
 * The per-circle copy comes from `app/utils/outreach.ts` verbatim — it is the user's own
 * wording and the one place it lives (CLAUDE.md §14), so this screen must not restate it.
 */
const TierInfoModal = ({ visible, onClose }: TierInfoModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Start unticked each time it opens, so reopening it deliberately from the header
  // doesn't present a box the user ticked in a previous session.
  useEffect(() => {
    if (visible) setDontShowAgain(false);
  }, [visible]);

  return (
    <ModalShell
      visible={visible}
      onRequestClose={() => onClose(dontShowAgain)}
      title='The 5-15-50 model'
      footer={
        <View className='flex-1 flex-row items-center justify-between gap-2'>
          <Checkbox
            checked={dontShowAgain}
            onChange={setDontShowAgain}
            label="Don't show this again"
          />
          <Button label='Got it' onPress={() => onClose(dontShowAgain)} />
        </View>
      }
    >
      <View className='mt-2 gap-4'>
        <Text className='font-nunito text-[14px] leading-5 text-ink-muted'>
          Your network works best in three circles. Put a contact in one and netup keeps
          track of when you last reached out, then reminds you when it&apos;s time again.
        </Text>

        {TIERS.map(tier => (
          <View key={tier} className={`gap-1.5 rounded-xl p-3 ${TIER_STYLES[tier].wash}`}>
            <View className='flex-row items-center justify-between gap-2'>
              <TierPill tier={tier} />
              <Text className={`font-nunito text-[12px] ${TIER_STYLES[tier].text}`}>
                {TIER_CADENCE_LABELS[tier]}
              </Text>
            </View>
            <Text className='font-nunito text-[13px] leading-5 text-ink-muted'>
              {TIER_DESCRIPTIONS[tier]}
            </Text>
          </View>
        ))}
      </View>
    </ModalShell>
  );
};

export default TierInfoModal;

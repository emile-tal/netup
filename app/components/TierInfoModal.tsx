import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
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

const PARAGRAPH = 'font-nunito text-[14px] leading-5 text-ink-muted';

interface TierInfoModalProps {
  visible: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

/**
 * What the 5-15-50 model is, why it works, and how to use the board — shown on the first
 * visit and reachable afterwards from the toolbar's info button. The board itself carries
 * none of this text, so this is the one place it is explained.
 *
 * The per-circle copy comes from `app/utils/outreach.ts` verbatim — it is the user's own
 * wording and the one place it lives (CLAUDE.md §14), so this screen must not restate it.
 */
const TierInfoModal = ({ visible, onClose }: TierInfoModalProps) => {
  // The copy runs longer than a phone screen; the panel scrolls rather than the backdrop.
  const { height } = useWindowDimensions();
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
      <ScrollView
        className='mt-2'
        style={{ maxHeight: height * 0.6 }}
        contentContainerStyle={{ gap: 16 }}
      >
        <Text className={PARAGRAPH}>
          Oxford professor Robin Dunbar&apos;s research suggests we can maintain about 150
          meaningful relationships, arranged in layers that grow less close as they grow
          larger. The 5-15-50 rule applies that to your professional network: sort contacts
          into three circles, and give each circle its own rhythm of contact.
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

        <Text className={PARAGRAPH}>
          A 2022 study of 20 million LinkedIn users, published in Science, found that
          moderately weak ties (people you know, but not closely) were the most valuable
          for changing jobs.
        </Text>
        <Text className={PARAGRAPH}>
          Keeping up 70 relationships, each on its own schedule, is hard to do from memory.
          netup sorts your network by circle and reminds you when each person is due.
        </Text>
        <Text className={PARAGRAPH}>
          Hold and drag a contact to move them between circles, or tap one to open their
          profile.
        </Text>
        <Text className='font-nunito text-[12px] leading-4 text-ink-subtle'>
          Rajkumar et al., &ldquo;A causal test of the strength of weak ties,&rdquo; Science
          377 (2022).
        </Text>
      </ScrollView>
    </ModalShell>
  );
};

export default TierInfoModal;

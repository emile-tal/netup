import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import {
  TIERS,
  TIER_CADENCE_LABELS,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  TIER_STYLES,
} from '../utils/outreach';

import Button from './Button';
import Checkbox from './Checkbox';
import ModalShell from './ModalShell';
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
      width='wide'
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
          Nobody can stay equally close to everyone they know. There are a few people you
          lean on, a wider ring you trust, and a larger group you know well enough to call
          on. The 5-15-50 model gives each of those rings a name and a rhythm, so the
          people who matter don&apos;t quietly drift away.
        </Text>

        <View className='overflow-hidden rounded-xl border border-line'>
          {TIERS.map((tier, i) => (
            <View
              key={tier}
              className={`flex-row items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${TIER_STYLES[tier].fill}`}
              >
                <Text className='font-nunito text-[14px] text-black'>{tier}</Text>
              </View>
              <View className='flex-1 gap-0.5'>
                <View className='flex-row flex-wrap items-baseline justify-between gap-x-2'>
                  <Text className='font-nunito text-[15px] text-ink'>
                    {TIER_LABELS[tier]}
                  </Text>
                  <Text className={`font-nunito text-[12px] ${TIER_STYLES[tier].text}`}>
                    {TIER_CADENCE_LABELS[tier]}
                  </Text>
                </View>
                <Text className='font-nunito text-[13px] leading-5 text-ink-muted'>
                  {TIER_DESCRIPTIONS[tier]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text className={PARAGRAPH}>
          Don&apos;t underrate the outer circle. People you know a little tend to move in
          different worlds from you, and that is often where the next opportunity turns
          up.
        </Text>
        <Text className={PARAGRAPH}>
          Seventy relationships on three different schedules is a lot to hold in your
          head. netup sorts your network by circle and tells you when each person is due.
        </Text>
        <Text className={PARAGRAPH}>
          Hold and drag a contact to move them between circles, or tap one to open their
          profile.
        </Text>
      </ScrollView>
    </ModalShell>
  );
};

export default TierInfoModal;

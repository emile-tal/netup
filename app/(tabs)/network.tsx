import { ScrollView, Text, View } from 'react-native';

import Header from '../components/Header';
import InfoIcon from '../icons/InfoIcon';
import ScreenLayout from '../components/ScreenLayout';
import ScreenState from '../components/ScreenState';
import TierBoard from '@/components/network/TierBoard';
import TierInfoModal from '../components/TierInfoModal';
import { TIERS } from '../utils/outreach';
import { colors } from '../theme';
import { useTierBoard } from '../hooks/useTierBoard';
import { useTierInfo } from '../hooks/useTierInfo';

/**
 * The 5-15-50 board: which circle each contact is in, and the only place that is changed.
 *
 * Moving a contact between circles rewrites their generated outreach reminder, so the
 * calendar reflects a drag immediately (see `db/repo/outreach.ts`).
 */
const NetworkPage = () => {
  const { buckets, loading, error, move, total } = useTierBoard();
  const { visible: infoVisible, open: openInfo, close: closeInfo } = useTierInfo();
  const assigned = TIERS.reduce((sum, tier) => sum + buckets.byTier[tier].length, 0);

  return (
    <ScreenLayout
      header={
        <Header
          title='5-15-50'
          subtitle={total > 0 ? `${assigned} of ${total} in a circle` : undefined}
          secondaryActionIcon={<InfoIcon size={20} color={colors.inkMuted} />}
          onSecondaryActionPress={openInfo}
          secondaryActionLabel='About the 5-15-50 model'
        />
      }
    >
      {total === 0 ? (
        <ScreenState
          loading={loading}
          error={error}
          emptyMessage='No contacts yet'
          emptyHint='Add people on the Contacts tab, then sort them into circles here.'
        />
      ) : (
        <ScrollView
          className='flex-1'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className='pb-3'>
            <Text className='font-nunito text-[13px] leading-5 text-ink-muted'>
              Hold a contact and drag them between circles. Each circle sets how often
              netup reminds you to reach out.
            </Text>
          </View>
          <TierBoard buckets={buckets} onMove={move} />
        </ScrollView>
      )}

      <TierInfoModal visible={infoVisible} onClose={closeInfo} />
    </ScreenLayout>
  );
};

export default NetworkPage;

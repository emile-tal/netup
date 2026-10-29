import { ScrollView } from 'react-native';

import InfoIcon from '../icons/InfoIcon';
import PageToolbar from '../components/PageToolbar';
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
 * Moving a contact between circles rewrites their generated outreach, so the calendar
 * reflects a drag immediately (see `db/repo/outreach.ts`). Tapping one opens their profile,
 * whose back arrow returns here.
 */
const NetworkPage = () => {
  const { buckets, loading, error, move, open, total } = useTierBoard();
  const { visible: infoVisible, open: openInfo, close: closeInfo } = useTierInfo();
  const assigned = TIERS.reduce((sum, tier) => sum + buckets.byTier[tier].length, 0);

  return (
    <ScreenLayout
      toolbar={
        <PageToolbar
          label={total > 0 ? `${assigned} of ${total} in a circle` : undefined}
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
          {/* How to use the board and what the circles mean live in the info panel —
              the toolbar's info button, and it opens by itself on the first visit. */}
          <TierBoard buckets={buckets} onMove={move} onOpen={open} />
        </ScrollView>
      )}

      <TierInfoModal visible={infoVisible} onClose={closeInfo} />
    </ScreenLayout>
  );
};

export default NetworkPage;
